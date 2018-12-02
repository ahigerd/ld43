"use strict";

return {
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
  image: assets.images.tileset,
};

