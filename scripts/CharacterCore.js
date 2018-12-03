"use strict";

return {
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
      if (dx && dy) {
        dx *= .71;
        dy *= .71;
      }
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
      if (dy < 0 && (dy < -Math.abs(dx))) {
        sprite.lastDir = 'up';
      } else if (dy > 0 && (dy > Math.abs(dx))) {
        sprite.lastDir = 'down';
      } else if (dx < 0 && (dx < -Math.abs(dy))) {
        sprite.lastDir = 'left';
      } else if (dx > 0 && (dx > Math.abs(dy))) {
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
    const camera = engine.cameras[0];
    const halfWidth = camera.width * .5;
    const halfHeight = camera.height * .5;
    let x = ((sprite._origin[0] * PIXELS_PER_UNIT) | 0) / PIXELS_PER_UNIT;
    let y = ((sprite._origin[1] * PIXELS_PER_UNIT) | 0) / PIXELS_PER_UNIT;
    if (x - halfWidth < window.tilemap.lastAabb[0]) {
      x = window.tilemap.lastAabb[0] + halfWidth;
    } else if (x + halfWidth > window.tilemap.lastAabb[2]) {
      x = window.tilemap.lastAabb[2] - halfWidth;
    }
    if (y - halfHeight < window.tilemap.lastAabb[1]) {
      y = window.tilemap.lastAabb[1] + halfHeight;
    } else if (y + halfHeight > window.tilemap.lastAabb[3]) {
      y = window.tilemap.lastAabb[3] - halfHeight;
    }
    engine.cameras[0].setXY(x, y);
  },
}
