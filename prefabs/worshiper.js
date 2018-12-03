"use strict";

function clamp(x, a, b) {
  return x < a ? a : (x > b ? b : x);
}

// TODO: better way of handling this
const methods = {
  setTargetMine(mine) {
    this.targetMine = mine;
    this.isWandering = false;
    this.destination.setXY(mine.origin[0], mine.origin[1] + .25);
  },
  setRandomDestination() {
    this.destination.setXY(this.origin[0] + Math.random() * 2 - 1, this.origin[1] + Math.random() * 2 - 1);
  },
};

return assets.require('scripts/CharacterCore.js').then(([CharacterCore]) => ({
  label: 'worshiper',
  animateHitboxes: false,
  defaultIsAnimating: true,
  defaultAnimationName: 'stand_down',
  hitboxes: [new Hitbox(-.10, -.05, .10, -.25, 0x1)],
  animations: {
    down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 16, 16, 16),
    ], 250.0),
    up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 32, 16, 16),
    ], 250.0),
    left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 48, 16, 16),
    ], 250.0),
    right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 64, 16, 16),
    ], 250.0),
    stand_down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
    ], 250.0),
    stand_up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
    ], 250.0),
    stand_left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
    ], 250.0),
    stand_right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
    ], 250.0),
    mining: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 0, 80, 16, 16),
    ], 250.0),
  },

  start() {
    this.lastDir = 'down';
    this.isWandering = true;
    this.targetMine = null;
    this.mineTimer = 0;
    this.destination = new Point(this.origin);
    this.stuckTimer = 10;
    Object.assign(this, methods);
  },

  update(scene, ms) {
    if (this.mineTimer > 0) {
      this.mineTimer -= ms;
      if (this.mineTimer <= 0) {
        this.destination.setXY(window.altar.origin[0], window.altar.origin[1]);
        this.targetMine = null;
      }
      return;
    } else if (this.isWandering) {
      if (this.destination.distanceTo(this.origin) < .1) {
        this.setRandomDestination();
      }
    }
    const dx = clamp(this.destination[0] - this.origin[0], -.2, .2);
    const dy = clamp(this.destination[1] - this.origin[1], -.2, .2);
    const speed = this.isWandering ? 1 : 2;

    const ox = this.origin[0];
    const oy = this.origin[1];
    CharacterCore.move(this, ms, dx * speed, dy * speed);
    if (Math.abs(this.origin[0] - ox) + Math.abs(this.origin[1] - oy) < .001) {
      this.stuckTimer--;
      if (this.stuckTimer <= 0) {
        console.log('stuck');
        if (this.targetMine) {
          this.targetMine.abandon();
          this.targetMine = null;
        }
        this.setRandomDestination();
      }
    } else {
      this.stuckTimer = 10;
    }
  },

  onCollisionEnter(other, coll) {
    if (other.label == 'worshiper') {
      this.onCollisionStay(other, coll);
    } else if (other == this.targetMine) {
      this.targetMine.deplete();

      this.setAnimation('mining');
      this.mineTimer = 2000;
      this.targetMine = null;
    } else if (other.label == 'altar') {
      this.isWandering = true;
      if (this.origin[0] < other.origin[0] - .3) {
        this.destination.setXY(this.origin[0] + Math.random() - 1, this.origin[1] + Math.random() * 2 - 1);
      } else if (this.origin[0] > other.origin[0] + .3) {
        this.destination.setXY(this.origin[0] + Math.random(), this.origin[1] + Math.random() * 2 - 1);
      } else if (this.origin[1] < other.origin[1]) {
        this.destination.setXY(this.origin[0] + Math.random() * 2 - 1, this.origin[1] + Math.random() - 1);
      } else {
        this.destination.setXY(this.origin[0] + Math.random() * 2 - 1, this.origin[1] + Math.random());
      }
    }
  },

  onCollisionStay(other, coll) {
    if (other.label != 'worshiper') {
      return;
    }
    this._origin.subtract(coll.penetration);
    this._origin.subtract(coll.penetration);
  }
}));
