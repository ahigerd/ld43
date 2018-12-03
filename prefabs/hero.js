"use strict";

function sortObjectsByDepth(lhs, rhs) {
  return (lhs.layer - rhs.layer) || (lhs._origin[1] - rhs._origin[1]);
}

return assets.require('scripts/CharacterCore.js').then(([CharacterCore]) => ({
  label: 'hero',
  animateHitboxes: false,
  defaultIsAnimating: true,
  defaultAnimationName: 'stand_down',
  hitboxes: [new Hitbox(-.10, -.05, .10, -.25, 0x1)],
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
    const moved = CharacterCore.move(this, ms, dx * 1.2, dy * 1.2);
    if (moved) {
      CharacterCore.centerCameraOn(this);
    }
  },

  lateUpdate(scene) {
    scene.objects.sort(sortObjectsByDepth);
  },
}));
