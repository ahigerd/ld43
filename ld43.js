"use strict";

const prefabs = {};

assets.loadImageAssets({
  hero: 'hero.png',
  coin: 'coin.png',
  tileset: 'tileset.png',
}).then(() => {
  prefabs.tilemap = {
    tileTypes: [
      { blank: true, bits: 0 },
      { x: 0, y: 0, bits: 0xFFFFFFFF },
      { x: 1, y: 0, bits: 0xFFFFFFFF },
      { x: 2, y: 0, bits: 0xFFFFFFFF },
      { x: 0, y: 1, bits: 0xFFFFFFFF },
      { x: 1, y: 1, bits: 0xFFFFFFFF },
      { x: 2, y: 1, bits: 0xFFFFFFFF },
      { x: 0, y: 2, bits: 0xFFFFFFFF },
      { x: 1, y: 2, bits: 0xFFFFFFFF },
      { x: 2, y: 2, bits: 0xFFFFFFFF },
    ],
    tiles: [
      0, 0, 0, 0, 4,
      0, 0, 6, 0, 7,
      0, 1, 5, 0, 0,
      1, 5, 5, 3, 0,
      4, 5, 5, 5, 3,
      7, 8, 8, 8, 9,
    ],
    tileSize: 16,
    width: 5,
    height: 6,
    image: assets.tileset,
  };
  prefabs.hero = {
    animateHitboxes: false,
    defaultIsAnimating: true,
    defaultAnimationName: 'right',
    hitboxes: [new Hitbox(-.17, .05, .15, .48, 0xFFFFFFFF)],
    animations: {
      left: new AnimationSequence([
        new AnimationFrame(assets.hero, 16, 16, -16, 16),
        new AnimationFrame(assets.hero, 32, 16, -16, 16),
        new AnimationFrame(assets.hero, 48, 16, -16, 16),
        new AnimationFrame(assets.hero, 64, 16, -16, 16),
      ], 250.0),
      right: new AnimationSequence([
        new AnimationFrame(assets.hero, 16, 16, 16, 16),
        new AnimationFrame(assets.hero, 32, 16, 16, 16),
        new AnimationFrame(assets.hero, 48, 16, 16, 16),
        new AnimationFrame(assets.hero, 64, 16, 16, 16),
      ], 250.0),
      runLeft: new AnimationSequence([
        new AnimationFrame(assets.hero, 16, 32, -16, 16),
        new AnimationFrame(assets.hero, 32, 32, -16, 16),
        new AnimationFrame(assets.hero, 48, 32, -16, 16),
        new AnimationFrame(assets.hero, 64, 32, -16, 16),
      ], 125.0),
      runRight: new AnimationSequence([
        new AnimationFrame(assets.hero, 16, 32, 16, 16),
        new AnimationFrame(assets.hero, 32, 32, 16, 16),
        new AnimationFrame(assets.hero, 48, 32, 16, 16),
        new AnimationFrame(assets.hero, 64, 32, 16, 16),
      ], 125.0),
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
      this.index = ' ';
      this.isGrounded = true;
    },

    update(scene, ms) {
      let dx = 0, dy = 0;
      if (Input.keys.ArrowLeft) dx--;
      if (Input.keys.ArrowRight) dx++;
      if (Input.keys.ArrowUp) dy--;
      if (Input.keys.ArrowDown) dy++;
      if (dx < 0) {
        this.setAnimation('runLeft');
        this.faceLeft = true;
      } else if (dx > 0) {
        this.setAnimation('runRight');
        this.faceLeft = false;
      } else if (dy != 0) {
        this.setAnimation(this.faceLeft ? 'runLeft' : 'runRight');
      } else {
        this.setAnimation(this.faceLeft ? 'left' : 'right');
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
      }
    },
  };

  window.tilemap = new TileMap(prefabs.tilemap, [0, -2]);
  scene.add(window.tilemap);

  window.hero = new Sprite(prefabs.hero, [.75, -1]);
  scene.add(window.hero);

  camera.setScale(2, 2);
  camera.setXY(0, 0);

  window.coords = document.createElement('PRE');
  window.coords.setAttribute('style', 'position: absolute; top: 0; left: 650px');
  document.body.appendChild(window.coords);

  engine.start();
});
