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

AFRAME.registerComponent('collider', {

   schema: {
      radius: { default: 1 },
   },

   init: function () {
      this.lastPosition = this.el.object3D.position.clone();
   },

   tick: function () {
      const position = this.el.object3D.position,
            radius = this.data.radius;

      const collidingObj = collidableObjects.find((obj) => {
         return obj.bounds
            && (position.x + radius) > obj.bounds.min.x
            && (position.x - radius) < obj.bounds.max.x
            && (position.z + radius) > obj.bounds.min.z
            && (position.z - radius) < obj.bounds.max.z;
      });

      // TODO: impl wall sliding and stop the jitter when colliding with a wall
      if (collidingObj) {
         position.copy(this.lastPosition);
      } else {
         this.lastPosition.copy(position);
      }
   },

});

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
   },

   init: function () {
      this.camera = this.el; // TODO: make configurable
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

      this.el.object3D.position.add(this.getMovementVector(delta));
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
         velocity.x += acceleration * delta* (l ? -1 : 1);
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
   el.setAttribute('color', '#efa0e0');
   el.setAttribute('rotation', '-90 0 0');

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

window.onload = () => {
   const seed = Math.floor(Math.random() * 100),
         prng = PRNG(seed),
         map = generateMap(prng, 10, 10);

   console.log(seed);
   renderMap(map);
}
