"use strict";

let state = 'title';
let score = 0;
let highScore;
try {
  highScore = localStorage.highScore | 0;
} catch (e) {
  highScore = 0;
}
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
highScoreSpan.innerText = highScore;

return assets.require('scripts/CharacterCore.js').then(([CharacterCore]) => {
  const GameManager = {
    wave: 0,
    kills: 0,

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
      engine.addEventListener('enginepause', this.onPause.bind(this));
      engine.addEventListener('enginestart', this.onStart.bind(this));
    },

    showTitle() {
      state = 'title';

      const scene = window.engine.activeScene = new Scene();

      assets.prefabs.tilemap.init();
      window.tilemap = new TileMap(assets.prefabs.tilemap, [-16, -16]);
      scene.add(window.tilemap);

      window.engine.step();

      document.getElementById('loading').style.display = 'none';
      document.getElementById('splash').style.display = 'block';
      document.getElementById('helppage').style.display = 'none';
      document.getElementById('gameOver').style.display = 'none';
      document.getElementById('statusBar').className = 'onTitle';

      CharacterCore.centerCameraOn(window.tilemap);
    },

    showHelp() {
      state = 'help';

      document.getElementById('splash').style.display = 'none';
      document.getElementById('helppage').style.display = 'block';
    },

    newLevel() {
      state = 'playing';
      window.droppedCoins = [];
      GameManager.wave = 2;
      GameManager.kills = 0;

      document.getElementById('splash').style.display = 'none';
      document.getElementById('gameOver').style.display = 'none';
      document.getElementById('statusBar').className = 'inGame';
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
      document.getElementById('worshipCount').innerText = window.worshipers.length;

      window.monsters = [];
      for (let i = 0; i < GameManager.wave; i++) {
        GameManager.spawnMonster(scene);
      }

      window.engine.start();
    },

    onPause() {
      if (state == 'playing') {
        document.getElementById('pauseBox').style.display = 'block';
      }
    },

    onStart() {
      if (state == 'playing') {
        document.getElementById('pauseBox').style.display = 'none';
      } else {
        engine.pause(false);
      }
    },

    gameOver() {
      state = 'gameover';
      document.getElementById('gameOver').style.display = 'block';
    },

    spawnMonster(scene) {
      let x, y;
      const monster = new Sprite(assets.prefabs.monster, [0, 0]);
      window.monsters.push(monster);
      do {
        x = (Math.random() * 64) | 0;
        y = (Math.random() * 64) | 0;
        monster._origin.setXY(x / 2 - 16, y / 2 - 16);
      } while (
        engine.cameras[0].aabb.containsXY(x, y) ||
        tilemap.bitsAt(monster._origin) & 9 || 
        tilemap.bitsAt(monster._origin[0], monster._origin[1] - 1) & 9 || 
        spawnTooClose(x, y, scene)
      );
      scene.add(monster);
    },

    addScore(points) {
      GameManager.setScore(score + points);
    },

    setScore(points) {
      score = points;
      scoreSpan.innerText = points;
      if (score > highScore) {
        highScore = score;
        highScoreSpan.innerText = highScore;
        try {
          localStorage.highScore = highScore;
        } catch (e) {
          // consume
        }
      }
    },
  };

  window.GameManager = GameManager;

  return GameManager;
});
