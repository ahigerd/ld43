"use strict";

const vectorCache = new Point(0, 0);

return {
  label: 'sword',
  animateHitboxes: false,
  defaultIsAnimating: false,
  defaultAnimationName: 'default',
  hitboxes: [new Hitbox(-.25, 0, .25, -.5, 0x1)],
  animations: {
    default: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 0, 80, 16, 16),
    ], 250.0),
    down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 96, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 112, 16, 16),
    ], 100.0),
    up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 112, 112, 16, 16),
    ], 100.0),
    left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 128, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 128, 112, 16, 16),
    ], 100.0),
    right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 144, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 144, 112, 16, 16),
    ], 100.0),
  },

  start(scene) {
    this.timer = 400;
  },

  update(scene, ms) {
    this.timer -= ms;
  },

  lateUpdate(scene) {
    if (this.timer <= 0) {
      this.timer = 0;
      scene.remove(this);
    }
  },

  onCollisionEnter(other) {
    if (other.label == 'hero' || other.label == 'worshiper') {
      if (other.label == 'hero' && other.attackTime > 0 && other.attackTime < 500) return;
      if (other.label == 'worshiper') {
        if (other.mineTimer > 0) return;
        vectorCache.set(other.origin);
        vectorCache.subtract(this.origin);
        vectorCache.normalize();
        other.destination.setXY(other.origin[0] + vectorCache[0] * 2, other.origin[1] + vectorCache[1] * 2);
        other.isWandering = false;
      }
      other.inflict(10);
    }
  },
};
