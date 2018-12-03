"use strict";

window.assets = new AssetStore();
window.engine = new Engine({ showFps: true });

function spawnTooClose(x, y, scene) {
  for (const obj of scene.nextObjects) {
    if (obj.isTileMap) continue;
    const dx2 = Math.sqrt(x/PIXELS_PER_UNIT - obj._origin[0]);
    const dy2 = Math.sqrt(y/PIXELS_PER_UNIT - obj._origin[1]);
    if (dx2 + dy2 < 1) return true;
  }
  for (const obj of scene.objects) {
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
  require: [
    'scripts/GameManager.js',
  ],
}).then(([GameManager]) => {
  GameManager.init();
  GameManager.showTitle();
});
