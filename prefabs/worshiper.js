"use strict";

const vectorCache = new Point(0, 0);

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
  },

  start() {
    this.lastDir = 'down';
    this.isWandering = true;
    this.targetMine = null;
    this.mineTimer = 0;
    this.destination = new Point(this.origin);
    this.stuckTimer = 10;
    this.coinTrail = [];
    CharacterCore.init(this);
    Object.assign(this, methods);
  },

  update(scene, ms) {
    if (this.mineTimer > 0) {
      this.mineTimer -= ms;
      if (this.mineTimer <= 0) {
        this.hidden = false;
        const coin = new Sprite(assets.prefabs.coin, this._origin);
        coin.setAnimation(this.mineValue);
        scene.add(coin);
        this.coinTrail.push(coin);

        this.destination.setXY(window.altar.origin[0], window.altar.origin[1]);
        this.targetMine = null;
      }
      return;
    } else if (this.isWandering) {
      if (this.destination.distanceTo(this.origin) < .1) {
        this.setRandomDestination();
      }
    } else if (this.destination.distanceTo(this.origin) < .1) {
      if (this.targetMine) {
        this.destination.setXY(this.targetMine.origin[0], this.targetMine.origin[1] + .25);
      } else if (this.coinTrail.length) {
        this.destination.setXY(window.altar.origin[0], window.altar.origin[1]);
      } else {
        this.isWandering = true;
        this.setRandomDestination();
      }
    }
    const dx = clamp(this.destination[0] - this.origin[0], -.2, .2);
    const dy = clamp(this.destination[1] - this.origin[1], -.2, .2);
    const speed = this.isWandering ? 1 : 2;

    const ox = this.origin[0];
    const oy = this.origin[1];
    CharacterCore.move(this, ms, dx * speed, dy * speed);
    if (!this.isWandering && Math.abs(this.origin[0] - ox) + Math.abs(this.origin[1] - oy) < .001) {
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

    for (let i = 1; i <= this.coinTrail.length; i++) {
      const coin = this.coinTrail[i - 1];
      vectorCache.set(this.origin);
      vectorCache.subtract(coin.origin);
      const dist = vectorCache.magnitude;
      if (dist > .5 * i) {
        coin.move(ms / 1000 * vectorCache[0] / dist, ms / 1000 * vectorCache[1] / dist);
      }
    }
  },

  onCollisionEnter(other, coll) {
    if (other.label == 'worshiper') {
      this.onCollisionStay(other, coll);
    } else if (other.label == 'mine' && other.ready) {
      this.mineValue = other.value;
      other.deplete();
      if (this.targetMine && other != this.targetMine) {
        this.targetMine.worshiper = null;
      }

      this.hidden = true;
      this.mineTimer = 2000;
      this.targetMine = null;
    } else if (other.label == 'altar') {
      for (const c of this.coinTrail) {
        c.depositing = true;
      }
      this.coinTrail.length = 0;

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
    vectorCache.set(this._origin);
    vectorCache.subtract(other._origin);
    vectorCache.normalize();
    CharacterCore.move(this, 500, vectorCache[0] * .02, vectorCache[1] * .02);
    this.setRandomDestination();
  }
}));
