"use strict";

const TreasureMine = {
  mines: [],
  addMine(x, y) {
    const sprite = new Sprite(assets.prefabs.mine, [x, y]); 
    scene.add(sprite);
    this.mines.push({ x, y, sprite });
  },
};

window.TreasureMine = TreasureMine;

return TreasureMine;
