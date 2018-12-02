"use strict";

const tilemap = {
  tileTypes: [
    { x: 0, y: 0, bits: 0 },
    { x: 0, y: 1, bits: 0 },
    { x: 1, y: 1, bits: 0 },
    { x: 2, y: 1, bits: 0 },
    { x: 0, y: 2, bits: 0 },
    { x: 1, y: 2, bits: 0 },
    { x: 2, y: 2, bits: 0 },
    { x: 0, y: 3, bits: 0 },
    { x: 1, y: 3, bits: 0 },
    { x: 2, y: 3, bits: 0 },
  ],
  /*
  tiles: [
    0, 0, 0, 0, 4,
    0, 0, 6, 0, 7,
    0, 1, 5, 0, 0,
    1, 5, 5, 3, 0,
    4, 5, 5, 5, 3,
    7, 8, 8, 8, 9,
  ],
  */
  tiles: new Array(64*64).fill(0),
  tileSize: 16,
  width: 64, // 5,
  height: 64, // 6,
  image: assets.images.tileset,
};

for (let y = 30; y < 35; y++) {
  for (let x = 30; x < 35; x++) {
    const pos = y * 64 + x;
    if (x == 30) {
      if (y == 30)
        tilemap.tiles[pos] = 1;
      else if (y == 34) 
        tilemap.tiles[pos] = 7;
      else
        tilemap.tiles[pos] = 4;
    } else if (x == 34) {
      if (y == 30)
        tilemap.tiles[pos] = 3;
      else if (y == 34) 
        tilemap.tiles[pos] = 9;
      else
        tilemap.tiles[pos] = 6;
    } else {
      if (y == 30)
        tilemap.tiles[pos] = 2;
      else if (y == 34) 
        tilemap.tiles[pos] = 8;
      else
        tilemap.tiles[pos] = 5;
    }
  }
}
tilemap.tiles[12*64+12] = 1;
tilemap.tiles[12*64+13] = 2;
tilemap.tiles[12*64+14] = 3;
tilemap.tiles[13*64+12] = 4;
tilemap.tiles[13*64+13] = 5;
tilemap.tiles[13*64+14] = 6;
tilemap.tiles[14*64+12] = 7;
tilemap.tiles[14*64+13] = 8;
tilemap.tiles[14*64+14] = 9;

return tilemap;
