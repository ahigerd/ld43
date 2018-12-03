"use strict";

return {
  label: 'mine',
  animateHitboxes: false,
  defaultIsAnimating: true,
  hitboxes: [new Hitbox(-.16, 0.2, .13, -.10, 0x1)],
  defaultAnimationName: 'default',
  animations: {
    default: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 0, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 0, 16, 16, 16),
   ], 150.0),
  },
};
