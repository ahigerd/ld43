"use strict";

function spawnTooClose(x, y, scene) {
  for (const obj of scene.nextObjects) {
    if (obj.isTileMap) continue;
    const dx2 = Math.sqrt(x/PIXELS_PER_UNIT - obj._origin[0]);
    const dy2 = Math.sqrt(y/PIXELS_PER_UNIT - obj._origin[1]);
    if (dx2 + dy2 < 1) return true;
  }
  return false;
}

assets.load({
  images: {
    sprites: 'assets/sprites.png',
    tileset: 'assets/tileset.png',
  },
  prefabs: {
    hero: 'prefabs/hero.js',
    tilemap: 'prefabs/tilemap.js',
    worshiper: 'prefabs/worshiper.js',
    coin: 'prefabs/coin.js',
    altar: 'prefabs/altar.js',
    mine: 'prefabs/mine.js',
  },
}).then(() => {
  window.tilemap = new TileMap(assets.prefabs.tilemap, [-16, -16]);
  scene.add(window.tilemap);

  window.altar = new Sprite(assets.prefabs.altar, [.25, 0]);
  scene.add(window.altar);

  window.hero = new Sprite(assets.prefabs.hero, [.25, 1]);
  scene.add(window.hero);

  let x, y;
  window.worshipers = [];
  for (let i = 0; i < 10; i++) {
    const worshiper = new Sprite(assets.prefabs.worshiper, [0, 0]);
    window.worshipers.push(worshiper);
    do {
      x = (Math.random() * 320 - 160) | 0;
      y = (Math.random() * 320 - 160) | 0;
      worshiper._origin.setXY(x / 32, y / 32);
    } while (tilemap.computeCollision(worshiper, true) || spawnTooClose(x, y, scene));
    scene.add(worshiper);
  }

  /*
  window.coins = [];
  const coinValues = Object.keys(assets.prefabs.coin.animations);
  for (let i = 0; i < 10; i++) {
    const coin = new Sprite(assets.prefabs.coin, [0, 0]);
    coin.setAnimation(coinValues[(coinValues.length * Math.random()) | 0]);
    window.coins.push(coin);
    do {
      x = (Math.random() * 320 - 160) | 0;
      y = (Math.random() * 320 - 160) | 0;
      coin._origin.setXY(x / 32, y / 32);
    } while (tilemap.computeCollision(coin, true) || spawnTooClose(x, y, scene));
    scene.add(coin);
  }
  */

  camera.setScale(2, 2);

  window.coords = document.createElement('PRE');
  window.coords.setAttribute('style', 'position: absolute; top: 0; left: 650px');
  document.body.appendChild(window.coords);

  engine.start();
});
