"use strict";

const PLAYER_HATE_RANGE = 2.5;
const MIN_CHASE_RANGE = .2;
const MAX_ATTACK_RANGE = .4;
const MIN_ATTACK_WAIT = 400;
const ATTACK_WAIT_RANGE = 400;

const vectorCache = new Point(0, 0);

// TODO: better way of handling this
const methods = {
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
    attack_down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 96, 80, 16, 16),
    ], 300.0),
    attack_up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 80, 16, 16),
    ], 300.0),
    attack_left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 128, 80, 16, 16),
    ], 300.0),
    attack_right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 144, 80, 16, 16),
    ], 300.0),
    dead: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 112, 0, 16, 16),
    ], 250.0),
  },

  start() {
    this.lastDir = 'down';
    this.attackCooldown = 0;
    CharacterCore.init(this);
    Object.assign(this, methods);
  },
  
  update(scene, ms) {
    const playerDist = this.origin.distanceTo(window.hero.origin);
    let nearest = window.hero;
    let nearestDist = playerDist;
    for (const w of window.worshipers) {
      if (w.hidden && w.dead) continue;
      const dist = this.origin.distanceTo(w.origin);
      if (dist < nearestDist) {
        nearest = w;
        nearestDist = dist;
      }
    }
    let attackDist = nearestDist;
    if (playerDist < PLAYER_HATE_RANGE) {
      nearest = window.hero;
      nearestDist = playerDist;
    }

    if (!this.oneShotName) {
      if (nearestDist > MIN_CHASE_RANGE) {
        vectorCache.set(nearest.origin);
        vectorCache.subtract(this.origin);
        vectorCache.normalize();
        CharacterCore.move(this, ms, vectorCache[0] * .5, vectorCache[1] * .5);
      }

      if (attackDist < MAX_ATTACK_RANGE && this.attackCooldown <= 0 && this.blinkTimer <= 0) {
        const weapon = this.weapon = new Sprite(assets.prefabs.sword);
        weapon.origin.set(this.origin);
        switch (this.lastDir) {
          case 'right': weapon.origin[0] += .2; break;
          case 'left': weapon.origin[0] -= .2; break;
          case 'down': weapon.origin[1] += .2; break;
          default: weapon.origin[1] -= .2; break;
        }
        weapon.setAnimation(this.lastDir);
        scene.add(weapon);
        this.playOneShot('attack_' + this.lastDir);
        this.attackCooldown = MIN_ATTACK_WAIT + Math.random() * ATTACK_WAIT_RANGE;
      }
    } 
    if (this.attackCooldown > 0) {
      this.attackCooldown -= ms;
    }
  },

  onCollisionEnter(other, coll) {
    this.onCollisionStay(other, coll);
  },

  onCollisionStay(other, coll) {
    if (!this.shouldCollide(other)) {
      return;
    }
    vectorCache.set(this._origin);
    vectorCache.subtract(other._origin);
    vectorCache.normalize();
    CharacterCore.move(this, 500, vectorCache[0] * .02, vectorCache[1] * .02);
  }
}));
