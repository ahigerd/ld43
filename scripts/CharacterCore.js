"use strict";

const spriteMethods = {
  shouldCollide(other) {
    return (
      other.label === 'worshiper' || 
      other.label === 'hero' ||
      other.label === 'monster'
    );
  },
  inflict(damage) {
    if (this.blinkTimer > 0) return;
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
      this.setAnimation('dead');
      this.blinkTimer = 1000;
      if (this.label === 'worshiper') {
        document.getElementById('npcdeathSound').play();
        if (this.targetMine) {
          this.targetMine.abandon(false);
        }
        if (this.coinTrail.length > 0) {
          droppedCoins.push(...this.coinTrail.splice(0, this.coinTrail.length));
        }
      } else if (this.label === 'monster') {
        document.getElementById('enemydeathSound').play();
      } else {
        document.getElementById('playerdeathSound').play();
      }
    } else {
      this.blinkTimer = 500;
      if (this.label === 'worshiper') {
        document.getElementById('npcdamageSound').play();
        let alarm = hero.danger.alarms.find(a => a.target === this);
        if (!alarm) {
          alarm = { target: this };
          hero.danger.alarms.push(alarm);
        }
        alarm.timer = 500;
      } else {
        document.getElementById('damageSound').play();
      }
    }
  },
  render(camera) {
    if (this.hidden) return;
    this.renderHealth(camera);
    Sprite.prototype.render.call(this, camera);
  },
  renderHealth(camera) {
    const layer = camera.layers[this.layer];
    const fraction = this.health < 0 ? 0 : this.health / this.maxHealth;
    const pixelRect = this.pixelRect;
    layer.fillStyle = `hsl(${fraction * 120},100%,50%)`;
    layer.fillRect(pixelRect[0], pixelRect[1] - 5, (pixelRect[2] - pixelRect[0] - .5) * fraction, 3);
  },
};

return {
  init(sprite) {
    sprite.lastDir = 'down';
    sprite.health = 100;
    sprite.maxHealth = 100;
    sprite.hidden = false;
    sprite.dead = false;
    sprite.blinkTimer = 0;
    Object.assign(sprite, spriteMethods);
    const baseUpdate = sprite.update.bind(sprite);
    sprite.update = function(scene, ms) {
      if (this.dead) {
        Sprite.prototype.update.call(this, scene, ms);
      } else {
        baseUpdate(scene, ms);
      }
      if (this.blinkTimer > 0) {
        this.blinkTimer -= ms;
        this.hidden = this.blinkTimer < 0 || this.blinkTimer > 500 ? false : (this.blinkTimer % 100 < 50);
        if (this.dead && this.blinkTimer < 0) {
          switch (this.label) {
            case 'worshiper':
              worshipers.splice(worshipers.indexOf(this), 1);
              document.getElementById('worshipCount').innerText = window.worshipers.length;
              break;
            case 'monster':
              monsters.splice(monsters.indexOf(this), 1);
              GameManager.addScore(100);
              GameManager.kills++;
              if (GameManager.kills >= GameManager.wave) {
                GameManager.wave++;
                GameManager.kills = 0;
              }
              while (monsters.length < GameManager.wave) {
                GameManager.spawnMonster(this.scene);
              }
              break;
            case 'hero':
              GameManager.gameOver();
              this.hidden = true;
              return; // don't remove from the scene
          }
          scene.remove(this);
        }
      }
    }
  },
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
    window.engine.cameras[0].setXY(x, y);
  },
}
