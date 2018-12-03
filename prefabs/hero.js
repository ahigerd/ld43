"use strict";

const TAU = Math.PI * 2;

const vectorCache = new Point(0, 0);

function sortObjectsByDepth(lhs, rhs) {
  if (lhs.label == 'sword' && rhs.label != 'sword') return 1;
  if (rhs.label == 'sword' && lhs.label != 'sword') return -1;
  if (lhs.label == 'coin' && lhs.depositing && rhs.label != 'coin') return 1;
  if (rhs.label == 'coin' && rhs.depositing && lhs.label != 'coin') return -1;
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
    attack: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 48, 112, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 112, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 112, 16, 16),
    ], 250.0),
  },

  start() {
    this.lastDir = 'down';
    CharacterCore.init(this);
    CharacterCore.centerCameraOn(this);
    this.baseRender = this.render;
    this.render = assets.prefabs.hero.render;
  },

  render(camera) {
    this.baseRender(camera);
    if (this.attackTime > 0) {
      const layer = camera.layers[this.layer];
      const pixelRect = this.pixelRect;
      layer.strokeStyle = 'white';
      layer.lineWidth = 3;
      const radius = (750 - this.attackTime) * .0005;
      layer.beginPath();
      layer.arc((pixelRect[0] + pixelRect[2]) * .5 - .5, (pixelRect[1] + pixelRect[3]) * .5, radius * PIXELS_PER_UNIT, 0, TAU, false); 
      layer.stroke();
    }
  },

  update(scene, ms) {
    if (this.attackTime > 0) {
      this.attackTime -= ms;
      const radius = (750 - this.attackTime) * .0005 + .25;
      for (const monster of monsters) {
        vectorCache.set(this.origin);
        vectorCache.subtract(monster.origin);
        const mag = vectorCache.magnitude;
        if (mag > radius) continue;
        vectorCache[0] = -vectorCache[0] / mag * (radius - mag);
        vectorCache[1] = -vectorCache[1] / mag * (radius - mag);
        const dir = monster.lastDir;
        CharacterCore.move(monster, 500, vectorCache[0], vectorCache[1]);
        monster.lastDir = dir;
        monster.setAnimation('stand_' + dir);
        monster.inflict(10);
      }
      return;
    }
    if (Input.keys[' ']) {
      this.playOneShot('attack');
      this.attackTime = 750;
      return;
    }
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

  onCollisionEnter(other, coll) {
    this.onCollisionStay(other, coll);
  },

  onCollisionStay(other, coll) {
    if (!(other.bits & this.bits)) {
      return;
    }
    vectorCache.set(this._origin);
    vectorCache.subtract(other._origin);
    vectorCache.normalize();
    CharacterCore.move(this, 500, vectorCache[0] * .02, vectorCache[1] * .02);
    this.setRandomDestination();
  }
}));
