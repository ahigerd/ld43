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

  start(scene) {
    const dist = this._origin[0] * this._origin[0] + this._origin[1] * this._origin[1];
    if (dist < 30) {
      this.value = 1;
    } else if (dist < 50) {
      this.value = 5;
    } else if (dist < 100) {
      this.value = 10;
    } else if (dist < 150) {
      this.value = 15;
    } else if (dist < 180) {
      this.value = 50;
    } else {
      this.value = 150;
    }

    const coin = new Sprite(assets.prefabs.coin, this._origin.added([-.05, .22]));
    coin.setAnimation(this.value);
    scene.add(coin);
  },
};
