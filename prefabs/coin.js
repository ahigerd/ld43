"use strict";

return {
  label: 'coin',
  hitboxes: [new Hitbox(-.2, .08, .2, .45, 0xFFFFFFFF)],
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
    ], 250.0),
    15: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 96, 0, 16, 16),
    ], 250.0),
    50: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 32, 0, 16, 16),
    ], 250.0),
    150: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 48, 0, 16, 16),
    ], 250.0),
  },

  onCollisionEnter(other) {
    if (other.label !== 'hero') {
      return;
    }
    console.log('collect', this.currentAnimationName);
    this.scene.remove(this);
  }
};
