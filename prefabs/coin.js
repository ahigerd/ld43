"use strict";

return {
  label: 'coin',
  hitboxes: [new Hitbox(-.2, -.02, .2, -.35, 0x1)],
  defaultIsAnimating: true,
  defaultAnimationName: 40,
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
    25: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 32, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 32, 80, 16, 16),
    ], 200.0),
    40: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 48, 0, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 96, 16, 16),
      new AnimationFrame(assets.images.sprites, 48, 80, 16, 16),
    ], 200.0),
  },

  start(scene) {
    this.depositing = false;
    this.rising = true;
  },

  update(scene, ms) {
    if (!this.depositing) return;
    if (this.rising) {
      if (this.origin[0] < window.altar.origin[0] - .1) {
        this.move(.001 * ms, -.001 * ms);
      } else if (this.origin[0] > window.altar.origin[0] + .1) {
        this.move(-.001 * ms, -.001 * ms);
      } else {
        this.move(0, -.001 * ms);
        if (this.origin[1] < window.altar.lastAabb[1] - .25) {
          this.rising = false;
        }
      }
    } else {
      this.move(0, .001 * ms);
    }
  },

  lateUpdate(scene) {
    if (this.depositing && !this.rising && this.origin[1] > window.altar.lastAabb[1] + .2) {
      const value = (this.currentAnimationName | 0);
      hero.health += value;
      if (hero.health > hero.maxHealth) hero.health = hero.maxHealth;
      if (this.depositor && !this.depositor.dead) {
        this.depositor.health += value;
        if (this.depositor.health > this.depositor.maxHealth) this.depositor.health = this.depositor.maxHealth;
      }
      scene.remove(this);
    }
  },
};
