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
    monster: 'prefabs/monster.js',
    sword: 'prefabs/sword.js',
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
      x = (Math.random() * 16 + 24) | 0;
      y = (Math.random() * 16 + 24) | 0;
      worshiper._origin.setXY(x / 2 - 16, y / 2 - 16);
    } while (tilemap.bitsAt(worshiper._origin) & 1 || 
        tilemap.bitsAt(worshiper._origin[0], worshiper._origin[1] - 1) & 1 || 
        spawnTooClose(x, y, scene));
    scene.add(worshiper);
  }

  window.monsters = [];
  for (let i = 0; i < 10; i++) {
    const monster = new Sprite(assets.prefabs.monster, [0, 0]);
    window.monsters.push(monster);
    do {
      x = (Math.random() * 64) | 0;
      y = (Math.random() * 64) | 0;
      monster._origin.setXY(x / 2 - 16, y / 2 - 16);
    } while (tilemap.bitsAt(monster._origin) & 9 || 
        tilemap.bitsAt(monster._origin[0], monster._origin[1] - 1) & 9 || 
        spawnTooClose(x, y, scene));
    scene.add(monster);
  }

  camera.setScale(2, 2);

  window.coords = document.createElement('PRE');
  window.coords.setAttribute('style', 'position: absolute; top: 0; left: 650px');
  document.body.appendChild(window.coords);

  engine.start();
});
