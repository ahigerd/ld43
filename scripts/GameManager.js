"use strict";

return assets.require('scripts/CharacterCore.js').then(([CharacterCore]) => {
  const GameManager = {
    init() {
      const camera = window.camera = new Camera(document.getElementById('camera'));
      camera.setXY(10, 7.5);
      camera.setScale(2, 2);
      camera.layers[0].font = '16px sans-serif';
      camera.layers[0].textAlign = 'center';
      camera.layers[0].textBaseline = 'middle';
      window.engine.cameras.push(camera);

      window.worshipers = [];

      engine.addEventListener('enginekeydown', e => e.detail.key === 'Escape' && engine.pause());
      engine.addEventListener('enginepause', e => pauseCheck.checked = true);
      engine.addEventListener('enginestart', e => pauseCheck.checked = false);
    },

    showTitle() {
      const scene = window.engine.activeScene = new Scene();

      assets.prefabs.tilemap.init();
      window.tilemap = new TileMap(assets.prefabs.tilemap, [-16, -16]);
      scene.add(window.tilemap);

      window.engine.step();

      document.getElementById('loading').style.display = 'none';
      document.getElementById('splash').style.display = 'block';
      document.getElementById('helppage').style.display = 'none';

      CharacterCore.centerCameraOn(window.tilemap);
    },

    showHelp() {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('helppage').style.display = 'block';
    },

    newLevel() {
      document.getElementById('splash').style.display = 'none';
      const scene = window.engine.activeScene = new Scene();

      assets.prefabs.tilemap.init();
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

      window.engine.start();
    },
  };

  window.GameManager = GameManager;

  return GameManager;
});
