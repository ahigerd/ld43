"use strict";

return {
  label: 'coin',
  hitboxes: [new Hitbox(-.2, -.02, .2, -.35, 0x1)],
  defaultIsAnimating: true,
  defaultAnimationName: 150,
  isTrigger: true,
  isPassive: true,
  animations: {
    1: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 0, 16, 16),
    ], 250.0),
    5: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 80, 0, 16, 16),
    ], 250.0),
    10: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 80, 16, 16),
    ], 200.0),
    15: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 96, 0, 16, 16),
    ], 250.0),
    50: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 32, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 80, 16, 16),
    ], 200.0),
    150: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 48, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 80, 16, 16),
    ], 200.0),
  },

  onCollisionEnter(other) {
    if (other.label !== 'hero') {
      return;
    }
    console.log('collect', this.currentAnimationName);
    this.scene.remove(this);
  }
};
