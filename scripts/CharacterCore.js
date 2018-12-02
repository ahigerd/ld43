"use strict";

Object.assign(this, {
  move(sprite, ms, dx, dy) {
    const moving = dx || dy;
    if (dy < 0) {
      sprite.lastDir = 'up';
    } else if (dy > 0) {
      sprite.lastDir = 'down';
    } else if (dx < 0) {
      sprite.lastDir = 'left';
    } else if (dx > 0) {
      sprite.lastDir = 'right';
    }
    if (dx || dy) {
      const bits = sprite.hitbox.bits;
      ms /= 500;
      dx *= ms;
      dy *= ms;
      const rx = sprite._origin[0] + sprite.hitbox[dx < 0 ? 0 : 2] + dx;
      const ry = sprite._origin[1] + sprite.hitbox[dy < 0 ? 1 : 3] + dy;
      if (dx) {
        if (window.tilemap.bitsAt(rx, sprite._origin[1] + sprite.hitbox[1]) & bits || window.tilemap.bitsAt(rx, sprite._origin[1] + sprite.hitbox[3]) & bits) {
          dx = 0;
        }
      }
      if (dy) {
        if (window.tilemap.bitsAt(sprite._origin[0] + sprite.hitbox[0], ry) & bits || window.tilemap.bitsAt(sprite._origin[0] + sprite.hitbox[2], ry) & bits) {
          dy = 0;
        }
      }
      const tileBits = window.tilemap.bitsAt(rx, ry);
      if (tileBits & 2) dx *= .5;
      if (tileBits & 4) dy *= .5;
      sprite.move(dx, dy);
      if (dy < 0 && !dx) {
        sprite.lastDir = 'up';
      } else if (dy > 0 && !dx) {
        sprite.lastDir = 'down';
      } else if (dx < 0 && !dy) {
        sprite.lastDir = 'left';
      } else if (dx > 0 && !dy) {
        sprite.lastDir = 'right';
      }
    }
    if (moving) {
      sprite.setAnimation(sprite.lastDir);
      return dx || dy;
    } else {
      sprite.setAnimation('stand_' + sprite.lastDir);
      return false;
    }
  },

  centerCameraOn(sprite) {
    engine.cameras[0].setXY(
      ((sprite._origin[0] * PIXELS_PER_UNIT) | 0) / PIXELS_PER_UNIT,
      ((sprite._origin[1] * PIXELS_PER_UNIT) | 0) / PIXELS_PER_UNIT,
    );
  },
});
