AFRAME.registerComponent('touch-controls', {
   schema: {
      enabled: { default: true },
      walkAcceleration: { default: 65 },
      runAcceleration: { default: 220 },
   },

   init: function () {
      this.easing = 1.1;
      this.velocity = new THREE.Vector3();
      this.inputs = {};

      document.addEventListener('keypress', function(e) {
         document.getElementById('camera').components['wasd-controls'].data.acceleration = e.shiftKey ? 220 : 65;
      });

      this.onInputDown = this.onInputDown.bind(this);
      this.onInputUp = this.onInputUp.bind(this);
   },

   play: function () {
      this.addEventListeners();
   },

   pause: function () {
      this.removeEventListeners();
   },

   remove: function () {
      this.pause();
   },

   addEventListeners: function () {
      const elems = document.querySelectorAll('.on-screen-controls button');

      elems.forEach((el) => {
         el.addEventListener('mousedown', this.onInputDown); // TODO: Needed?
         el.addEventListener('touchstart', this.onInputDown);
         el.addEventListener('mouseup', this.onInputUp); // TODO: Needed?
         el.addEventListener('touchend', this.onInputUp);
         el.addEventListener('touchcancel', this.onInputUp);
      });
   },

   removeEventListeners: function () {
      const elems = document.querySelectorAll('.on-screen-controls button');

      elems.forEach((el) => {
         el.removeEventListener('mousedown', this.onInputDown); // TODO: Needed?
         el.removeEventListener('touchstart', this.onInputDown);
         el.removeEventListener('mouseup', this.onInputUp); // TODO: Needed?
         el.removeEventListener('touchend', this.onInputUp);
         el.removeEventListener('touchcancel', this.onInputUp);
      });
   },

   onInputDown: function (event) {
      this.inputs[event.target.dataset.input] = true;
      event.preventDefault();
   },

   onInputUp: function (event) {
      delete this.inputs[event.target.dataset.input];
      event.preventDefault();
   },

   tick: function (time, delta) {
      var data = this.data;
      var velocity = this.velocity;

      if (!data.enabled) { return; }

      delta = delta / 1000;
      this.updateVelocity(delta);

      if (!velocity.z) {
         return;
      }

      this.el.object3D.position.add(this.getMovementVector(delta));
   },

   updateVelocity: function (delta) {
      var acceleration;
      var data = this.data;
      var velocity = this.velocity;

      // If FPS too low, reset velocity.
      if (delta > 0.2) {
         velocity.z = 0;
         return;
      }

      // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
      var scaledEasing = Math.pow(1 / this.easing, delta * 60);

      if (velocity.z !== 0) {
         velocity.z -= velocity.z * scaledEasing;
      }

      if (Math.abs(velocity.z) < 0.00001) {
         velocity.z = 0;
      }

      acceleration = this.inputs.run ? data.runAcceleration : data.walkAcceleration;

      if (this.inputs.walk || this.inputs.run) {
         velocity.z -= acceleration * delta;
      }
   },

   getMovementVector: (function () {
      var directionVector = new THREE.Vector3(0, 0, 0);
      var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

      return function (delta) {
         const rotation = this.el.getAttribute('rotation'),
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

document.addEventListener('keypress', function(e) {
   document.getElementById('camera').components['wasd-controls'].data.acceleration = e.shiftKey ? 220 : 65;
});
