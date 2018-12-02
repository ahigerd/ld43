"use strict";

return assets.require('scripts/CharacterCore.js').then(([CharacterCore]) => ({
  label: 'hero',
  animateHitboxes: false,
  defaultIsAnimating: true,
  defaultAnimationName: 'stand_down',
  hitboxes: [new Hitbox(-.10, .05, .10, .48, 0xFFFFFFFF)],
  animations: {
    down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 16, 16, 16),
    ], 250.0),
    up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 32, 16, 16),
    ], 250.0),
    left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 48, 16, 16),
    ], 250.0),
    right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 16, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 64, 16, 16),
    ], 250.0),
    stand_down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 16, 16, 16),
    ], 250.0),
    stand_up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 32, 16, 16),
    ], 250.0),
    stand_left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 48, 16, 16),
    ], 250.0),
    stand_right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 64, 16, 16),
    ], 250.0),
  },

  /*
  render(camera) {
    Sprite.prototype.render.call(this, camera);
    const rect = this.hitbox.translated(this.origin);
    const layer = camera.layers[this.layer];
    layer.strokeStyle = 'black';
    layer.beginPath();
    layer.rect(
      (PIXELS_PER_UNIT * rect[0]) - .5,
      (PIXELS_PER_UNIT * rect[1]) - .5,
      (PIXELS_PER_UNIT * (rect[2] - rect[0])),
      (PIXELS_PER_UNIT * (rect[1] - rect[3])),
    );
    layer.stroke();
  },
  */

  start() {
    this.lastDir = 'down';
    CharacterCore.centerCameraOn(this);
  },

  update(scene, ms) {
    let dx = 0, dy = 0;
    if (Input.keys.ArrowLeft) dx--;
    if (Input.keys.ArrowRight) dx++;
    if (Input.keys.ArrowUp) dy--;
    if (Input.keys.ArrowDown) dy++;
    const moved = CharacterCore.move(this, ms, dx, dy);
    if (moved) {
      CharacterCore.centerCameraOn(this);
    }
  },
}));
