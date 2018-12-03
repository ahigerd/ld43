"use strict";

const PLAYER_HATE_RANGE = 2.5;
const MIN_CHASE_RANGE = .3;

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
  label: 'monster',
  animateHitboxes: false,
  defaultIsAnimating: true,
  defaultAnimationName: 'stand_down',
  hitboxes: [new Hitbox(-.10, -.05, .10, -.25, 0x9)],
  animations: {
    down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 128, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 112, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 144, 16, 16, 16),
    ], 250.0),
    up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 128, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 112, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 144, 32, 16, 16),
    ], 250.0),
    left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 128, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 112, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 144, 48, 16, 16),
    ], 250.0),
    right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 128, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 112, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 144, 64, 16, 16),
    ], 250.0),
    stand_down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 16, 16, 16),
    ], 250.0),
    stand_up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 32, 16, 16),
    ], 250.0),
    stand_left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 48, 16, 16),
    ], 250.0),
    stand_right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 64, 16, 16),
    ], 250.0),
  },

  start() {
    this.lastDir = 'down';
    Object.assign(this, methods);
  },
  
  update(scene, ms) {
    const playerDist = this.origin.distanceTo(window.hero.origin);
    let nearest = window.hero;
    let nearestDist = playerDist;
    if (playerDist > PLAYER_HATE_RANGE) {
      for (const w of window.worshipers) {
        const dist = this.origin.distanceTo(w.origin);
        if (dist < nearestDist) {
          nearest = w;
          nearestDist = dist;
        }
      }
    }

    if (nearestDist > MIN_CHASE_RANGE) {
      vectorCache.set(nearest.origin);
      vectorCache.subtract(this.origin);
      vectorCache.normalize();
      CharacterCore.move(this, ms, vectorCache[0] * .5, vectorCache[1] * .5);
    }
  },

  onCollisionEnter(other, coll) {
    if (other.label == 'monster') {
      this.onCollisionStay(other, coll);
    }
  },

  onCollisionStay(other, coll) {
    if (other.label != 'monster') {
      return;
    }
    vectorCache.set(this._origin);
    vectorCache.subtract(other._origin);
    vectorCache.normalize();
    this.move(vectorCache[0] * .02, vectorCache[1] * .02);
  }
}));
