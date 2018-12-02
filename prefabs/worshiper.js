"use strict";

return {
  animateHitboxes: false,
  defaultIsAnimating: true,
  defaultAnimationName: 'stand_down',
  hitboxes: [new Hitbox(-.10, .05, .10, .48, 0xFFFFFFFF)],
  animations: {
    down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 16, 16, 16),
    ], 250.0),
    up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 32, 16, 16),
    ], 250.0),
    left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 48, 16, 16),
    ], 250.0),
    right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
      new AnimationFrame(assets.images.sprites, 96, 64, 16, 16),
    ], 250.0),
    stand_down: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 16, 16, 16),
    ], 250.0),
    stand_up: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 32, 16, 16),
    ], 250.0),
    stand_left: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 48, 16, 16),
    ], 250.0),
    stand_right: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 64, 16, 16),
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
  },

  update(scene, ms) {
    return;
    let dx = 0, dy = 0;
    if (Input.keys.ArrowLeft) dx--;
    if (Input.keys.ArrowRight) dx++;
    if (Input.keys.ArrowUp) dy--;
    if (Input.keys.ArrowDown) dy++;
    const moving = dx || dy;
    if (dy < 0) {
      this.lastDir = 'up';
    } else if (dy > 0) {
      this.lastDir = 'down';
    } else if (dx < 0) {
      this.lastDir = 'left';
    } else if (dx > 0) {
      this.lastDir = 'right';
    }
    if (dx || dy) {
      ms /= 500;
      dx *= ms;
      dy *= ms;
      const rx = this._origin[0] + this.hitbox[dx < 0 ? 0 : 2] + dx;
      const ry = this._origin[1] + this.hitbox[dy < 0 ? 1 : 3] + dy;
      if (dx) {
        if (window.tilemap.bitsAt(rx, this._origin[1] + this.hitbox[1]) || window.tilemap.bitsAt(rx, this._origin[1] + this.hitbox[3])) {
          dx = 0;
        }
      }
      if (dy) {
        if (window.tilemap.bitsAt(this._origin[0] + this.hitbox[0], ry) || window.tilemap.bitsAt(this._origin[0] + this.hitbox[2], ry)) {
          dy = 0;
        }
      }
      this.move(dx, dy);
      if (dy < 0 && !dx) {
        this.lastDir = 'up';
      } else if (dy > 0 && !dx) {
        this.lastDir = 'down';
      } else if (dx < 0 && !dy) {
        this.lastDir = 'left';
      } else if (dx > 0 && !dy) {
        this.lastDir = 'right';
      }
    }
    if (moving) {
      this.setAnimation(this.lastDir);
    } else {
      this.setAnimation('stand_' + this.lastDir);
    }
  },
};
