let collidableObjects = [];

AFRAME.registerComponent('collidable', {
   init: function () {
      this.bounds = new THREE.Box3();
      collidableObjects.push(this);
   },

   update: function() {
      this.bounds.setFromObject(this.el.object3D);
   },

});

function calculateCollision(current, future, aabb) {
   if (current.x === future.x && current.y === future.y) {
     return;
   }

   const radius = current.radius,
         currentN = current.y - radius,
         currentE = current.x + radius,
         currentS = current.y + radius,
         currentW = current.x - radius,
         futureN = future.y - radius,
         futureE = future.x + radius,
         futureS = future.y + radius,
         futureW = future.x - radius,
         aabbN = aabb.n,
         aabbE = aabb.e,
         aabbS = aabb.s,
         aabbW = aabb.w;


   const isNearAABB = Math.max(currentE, futureE) > aabbW
     && Math.min(currentW, futureW) < aabbE
     && Math.max(currentS, futureS) > aabbN
     && Math.min(currentN, futureN) < aabbS;

   if (!isNearAABB) {
     return;
   }

   const dx = future.x - current.x,
         dy = future.y - current.y,
         invdx = (dx === 0 ? 0 : 1 / dx),
         invdy = (dy === 0 ? 0 : 1 / dy);

   let cornerX, cornerY;

   if (currentW < aabbW && futureE > aabbW) {
     const timeToCollision = (aabbW - currentE) * invdx;

     if (timeToCollision >= 0 && timeToCollision <= 1) {
       const yAtCollision = current.y + dy * timeToCollision;

       if (yAtCollision >= aabbN && yAtCollision <= aabbS) {
         return {
           t: timeToCollision,
           x: current.x + dx * timeToCollision,
           y: yAtCollision,
           nx: -1,
           ny: 0,
         };
       }
     }
     cornerX = aabbW;
   }

   if (currentE > aabbE && futureW < aabbE) {
     const timeToCollision = (aabbE - currentW) * invdx;

     if (timeToCollision >= 0 && timeToCollision <= 1) {
       const yAtCollision = current.y + dy * timeToCollision;

       if (yAtCollision >= aabbN && yAtCollision <= aabbS) {
         return {
           t: timeToCollision,
           x: current.x + dx * timeToCollision,
           y: yAtCollision,
           nx: 1,
           ny: 0,
         };
       }
     }
     cornerX = aabbE;
   }

   if (currentN < aabbN && futureS > aabbN) {
     const timeToCollision = (aabbN - currentS) * invdy;

     if (timeToCollision >= 0 && timeToCollision <= 1) {
       const xAtCollision = current.x + dx * timeToCollision;

       if (xAtCollision >= aabbW && xAtCollision <= aabbE) {
         isColliding = true;
         return {
           t: timeToCollision,
           x: xAtCollision,
           y: current.y + dy * timeToCollision,
           nx: 0,
           ny: -1,
         };
       }
     }
     cornerY = aabbN;
   }

   if (currentS > aabbS && futureN < aabbS) {
     const timeToCollision = (aabbS - currentN) * invdy;

     if (timeToCollision >= 0 && timeToCollision <= 1) {
       const xAtCollision = current.x + dx * timeToCollision;

       if (xAtCollision >= aabbW && xAtCollision <= aabbE) {
         return {
           t: timeToCollision,
           x: xAtCollision,
           y: current.y + dy * timeToCollision,
           nx: 0,
           ny: 1,
         };
       }
     }
     cornerY = aabbS;
   }

   if (cornerX === undefined && cornerY === undefined){
     return;
   }

   if (cornerX !== undefined && cornerY === undefined) {
     cornerY = (dy > 0 ? aabbS : aabbN);
   } else if (cornerY !== undefined && cornerX === undefined) {
     cornerX = (dx > 0 ? aabbE : aabbW);
   }

   const inverseRadius = 1 / radius,
         lineLength = Math.sqrt(dx * dx + dy * dy),
         cornerdx = cornerX - current.x,
         cornerdy = cornerY - current.y,
         cornerDistance = Math.sqrt(cornerdx * cornerdx + cornerdy * cornerdy);
         innerAngle = Math.acos((cornerdx * dx + cornerdy * dy) / (lineLength * cornerDistance));

   if (cornerDistance < radius) {
     return;
   }

   if (innerAngle === 0) {
     const timeToCollision = (cornerDistance - radius) / lineLength;

     if (timeToCollision > 1 || timeToCollision < 0){
       return;
     }

     return {
       t: timeToCollision,
       x: current.x + dx * timeToCollision,
       y: current.y + dy * timeToCollision,
       nx: cornerdx / cornerDistance,
       ny: cornerdy / cornerDistance,
     };
   }

   const innerAngleSin = Math.sin(innerAngle),
         angle1Sin = innerAngleSin * cornerDistance * inverseRadius;

   if (Math.abs(angle1Sin) > 1) {
     return;
   }

   const angle1 = Math.PI - Math.asin(angle1Sin),
         angle2 = Math.PI - innerAngle - angle1,
         intersectionDistance = radius * Math.sin(angle2) / innerAngleSin,
         timeToCollision = intersectionDistance / lineLength;

   if (timeToCollision > 1 || timeToCollision < 0) {
     return;
   }

   return {
     t: timeToCollision,
     x: current.x + dx * timeToCollision,
     y: current.y + dy * timeToCollision,
     nx: (timeToCollision * dx + current.x - cornerX) * inverseRadius,
     ny: (timeToCollision * dy + current.y - cornerY) * inverseRadius,
   };
}

// Keyboard input
// Based on: https://xem.github.io/articles/jsgamesinputs.html
u=l=d=r=s=0;onkeydown=onkeyup=e=>{top['lld*rlurdu'[e.which%32%17]]=e.type[5]; s=e.shiftKey};

// Touch input (buttons)
document.onreadystatechange = function () {
   if (document.readyState !== 'complete') {
      return;
   }

   const handler = (v) => {
      return (event) => {
         event.target.dataset.inputs.split(',').forEach((input) => {
            top[input] = v;
         });
         event.preventDefault();
      };
   };

   document.querySelectorAll('.on-screen-controls button').forEach((e) => {
      e.addEventListener('mousedown', handler(true));
      e.addEventListener('touchstart', handler(true));
      e.addEventListener('mouseup', handler());
      e.addEventListener('touchend', handler());
      e.addEventListener('touchcancel', handler());
   });
};

// Touch input (on-screen, for VR)
// TODO: Impl

AFRAME.registerComponent('movement', {
   schema: {
      walk: { default: 65 },
      run: { default: 220 },
      radius: { default: 1 },
      camera: { default: '' },
   },

   init: function () {
      this.camera = this.data.camera ? document.getElementById(this.data.camera) : this.el;
      this.easing = 1.1;
      this.velocity = new THREE.Vector3();
   },

   tick: function (time, delta) {
      const velocity = this.velocity;

      delta = delta / 1000;
      this.updateVelocity(delta);

      if (!velocity.x && !velocity.z) {
         return;
      }

      // TODO: stop creating these each tick?
      const current = {
         x: this.el.object3D.position.x * 100,
         y: this.el.object3D.position.z * 100,
         radius: this.data.radius * 100,
      };

      const newPosition = new THREE.Vector3(0, 0, 0);

      newPosition.copy(this.el.object3D.position).add(this.getMovementVector(delta));

      const future = {
         x: newPosition.x * 100,
         y: newPosition.z * 100,
      };

      collidableObjects.forEach((obj) => {
         if (!obj.bounds) {
            return;
         }

         collision = calculateCollision(current, future, {
            n: obj.bounds.min.z * 100,
            s: obj.bounds.max.z * 100,
            e: obj.bounds.max.x * 100,
            w: obj.bounds.min.x * 100,
         });

         if (collision) {
            const remainingTime = 1 - collision.t,
                  dx = future.x - current.x,
                  dy = future.y - current.y,
                  dot = dx * collision.nx + dy * collision.ny,
                  ndx = dx - 2 * dot * collision.nx,
                  ndy = dy - 2 * dot * collision.ny;

            future.x = collision.x + ndx * remainingTime,
            future.y = collision.y + ndy * remainingTime;
         }
      });

      newPosition.x = future.x / 100;
      newPosition.z = future.y / 100;

      this.el.object3D.position.copy(newPosition);
   },

   updateVelocity: function (delta) {
      const velocity = this.velocity;

      // If FPS too low, reset velocity.
      if (delta > 0.2) {
         velocity.x = 0;
         velocity.z = 0;
         return;
      }

      // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
      const scaledEasing = Math.pow(1 / this.easing, delta * 60);

      if (velocity.x !== 0) {
         velocity.x -= velocity.x * scaledEasing;
      }

      if (velocity.z !== 0) {
         velocity.z -= velocity.z * scaledEasing;
      }

      if (Math.abs(velocity.x) < 0.00001) {
         velocity.x = 0;
      }
      if (Math.abs(velocity.z) < 0.00001) {
         velocity.z = 0;
      }

      const acceleration = s ? this.data.run : this.data.walk;

      if (u || d) {
         velocity.z += acceleration * delta * (u ? -1 : 1);
      }

      if (l || r) {
         velocity.x += acceleration * delta * (l ? -1 : 1);
      }
   },

   getMovementVector: (function () {
      // TODO: stop creating these each tick?
      var directionVector = new THREE.Vector3(0, 0, 0);
      var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

      return function (delta) {
         const rotation = this.camera.getAttribute('rotation'),
               velocity = this.velocity;

         directionVector.copy(velocity);
         directionVector.multiplyScalar(delta);

         if (!rotation) { return directionVector; }

         rotationEuler.set(0, THREE.Math.degToRad(rotation.y), 0);
         directionVector.applyEuler(rotationEuler);
         return directionVector;
      };
   })(),

});

function makeWallEl(width) {
   const el = document.createElement('a-box');

   el.setAttribute('width', width);
   el.setAttribute('height', '4');
   el.setAttribute('depth', '0.25');
   el.setAttribute('color', '#ededea');
   el.setAttribute('collidable', '');
   return el;
}

function createWall(mapX, mapY, dir, style) {
   if (style === 'gap') {
      return;
   }

   const sceneEl = document.querySelector('a-scene');

   let cellX = 0,
       cellZ = 0;

   if (dir === 0) {
      cellX = 0;
      cellZ = -4;
   } else if (dir === 1) {
      cellX = 4;
      cellZ = 0;
   } else if (dir === 2) {
      cellX = 0;
      cellZ = 4;
   } else {
      cellX = -4;
      cellZ = 0;
   }

   if (style === 'door') {
      const sideA = makeWallEl('2.5');
            sideB = makeWallEl('2.5');

      sideA.setAttribute('position', `${(mapX * 8) + cellX + ((dir + 1) % 2 * 2.75)} 2 ${(mapY * 8) + cellZ + (dir % 2 * 2.75)}`);
      sideA.setAttribute('rotation', `0 ${dir % 2 * 90} 0`);
      sceneEl.appendChild(sideA);

      sideB.setAttribute('position', `${(mapX * 8) + cellX + ((dir + 1) % 2 * -2.75)} 2 ${(mapY * 8) + cellZ + (dir % 2 * -2.75)}`);
      sideB.setAttribute('rotation', `0 ${dir % 2 * 90} 0`);
      sceneEl.appendChild(sideB);
   } else {
      const el = makeWallEl('8');

      el.setAttribute('position', `${(mapX * 8) + cellX} 2 ${(mapY * 8) + cellZ}`);
      el.setAttribute('rotation', `0 ${dir % 2 * 90} 0`);
      sceneEl.appendChild(el);
   }
}

function createFloor(mapW, mapH) {
   const el = document.createElement('a-plane'),
         sceneEl = document.querySelector('a-scene'),
         w = mapW * 8,
         h = mapH * 8;

   el.setAttribute('position', `${w / 2 - 4} 0 ${h / 2 - 4}`);
   el.setAttribute('width', w);
   el.setAttribute('height', h);
   el.setAttribute('rotation', '-90 0 0');
   el.setAttribute('material', `src: #floor; repeat: ${w * 1.6}, ${h * 1.6}`);

   sceneEl.appendChild(el);
}

const PRNG = function(seed) {
   return {
      next: function() {
         seed = (seed * 9301 + 49297) % 233280;
         return seed / 233280;
      },
      between: function(min, max, asInt) {
         const val = min + this.next(asInt) * (max - min);

         return asInt ? Math.round(val) : val;
      },
   };
};

function generateMap(prng, width, height) {
   const boundaries = [ 'gap', 'wall', 'door' ];

   return [...Array(height).keys()].map((y) => {
      return [...Array(width).keys()].map((x) => {
         return {
            N: y === 0 ? 'wall' : boundaries[prng.between(0, 2, true)],
            W: x === 0 ? 'wall' : boundaries[prng.between(0, 2, true)],
         };
      });
   });
}

function renderMap(map) {
   const mapHeight = map.length,
         mapWidth = map[0].length;

   createFloor(mapHeight, mapWidth);
   map.forEach((row, y) => {
      row.forEach((cell, x) => {
         createWall(x, y, 0, cell.N);
         createWall(x, y, 3, cell.W);
      });
      createWall(mapWidth, y, 3, 'wall');
   });

   map[0].forEach((cell, x) => {
      createWall(x, mapHeight, 0, 'wall');
   });
}

function drawFloorTexture() {
   const floorCanvas = document.getElementById('floor'),
         floorCanvasCtx = floorCanvas.getContext('2d'),
         canvasWidth = floorCanvas.width,
         canvasHeight = floorCanvas.height;

   floorCanvasCtx.fillStyle = '#eee';
   floorCanvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

   floorCanvasCtx.strokeStyle = '#333';
   floorCanvasCtx.lineWidth = 1;

   drawPolygon(floorCanvasCtx, 0, 0, canvasWidth / 2, 6);
   floorCanvasCtx.stroke();
   drawPolygon(floorCanvasCtx, canvasWidth, canvasHeight, canvasWidth / 2, 6);
   floorCanvasCtx.stroke();

   floorCanvasCtx.strokeStyle = '#aaa';
   floorCanvasCtx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

function drawPolygon(ctx, x, y, radius, sides) {
   if (sides < 3) {
      return;
   }

   const angle = (Math.PI * 2) / sides;

   ctx.beginPath();
   ctx.translate(x, y);
   ctx.moveTo(radius, 0);
   for (let i = 1; i < sides; i++) {
      ctx.lineTo(radius * Math.cos(angle * i), radius * Math.sin(angle * i));
   }
   ctx.closePath();
   ctx.translate(-x, -y);
 }


window.onload = () => {
   const seed = Math.floor(Math.random() * 100),
         prng = PRNG(seed),
         map = generateMap(prng, 10, 10);

   console.log(seed);

   drawFloorTexture();
   renderMap(map);
}
