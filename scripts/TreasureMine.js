"use strict";

class TreasureMine {
  constructor() {
    window.treasureMine = this;
    this.mines = [];
  }

  addMine(x, y) {
    const sprite = new Sprite(assets.prefabs.mine, [x, y]); 
    engine.activeScene.add(sprite);
    this.mines.push({ x, y, sprite });
  }
};

return TreasureMine;
