"use strict";

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
  },
}).then(() => {
  window.tilemap = new TileMap(assets.prefabs.tilemap, [0, -2]);
  scene.add(window.tilemap);

  window.worshipers = [];
  for (let i = 0; i < 10; i++) {
    const worshiper = new Sprite(assets.prefabs.worshiper, [0, 0]);
    window.worshipers.push(worshiper);
    do {
      const x = Math.random() * 10 - 5;
      const y = Math.random() * 10 - 5;
      worshiper._origin.setXY(x, y);
    } while (tilemap.computeCollision(worshiper, true));
    scene.add(worshiper);
  }

  window.coins = [];
  const coinValues = Object.keys(assets.prefabs.coin.animations);
  for (let i = 0; i < 10; i++) {
    const coin = new Sprite(assets.prefabs.coin, [0, 0]);
    coin.setAnimation(coinValues[(coinValues.length * Math.random()) | 0]);
    window.coins.push(coin);
    do {
      const x = Math.random() * 10 - 5;
      const y = Math.random() * 10 - 5;
      coin._origin.setXY(x, y);
    } while (tilemap.computeCollision(coin, true));
    scene.add(coin);
  }

  window.hero = new Sprite(assets.prefabs.hero, [.75, -1]);
  scene.add(window.hero);

  camera.setScale(2, 2);
  camera.setXY(0, 0);

  window.coords = document.createElement('PRE');
  window.coords.setAttribute('style', 'position: absolute; top: 0; left: 650px');
  document.body.appendChild(window.coords);

  engine.start();
});
