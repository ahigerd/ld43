"use strict";

const tilemap = {
  tileTypes: [
    { x: 3, y: 0, bits: 0 }, // grass
    { x: 5, y: 0, bits: 6 }, // tiles TL
    { x: 6, y: 0, bits: 4 }, // tiles T
    { x: 7, y: 0, bits: 6 }, // tiles TR
    { x: 5, y: 1, bits: 2 }, // tiles L
    { x: 6, y: 1, bits: 0 }, // tiles
    { x: 7, y: 1, bits: 2 }, // tiles R
    { x: 5, y: 2, bits: 6 }, // tiles BL
    { x: 6, y: 2, bits: 4 }, // tiles B
    { x: 7, y: 2, bits: 6 }, // tiles BR
    { x: 0, y: 0, bits: 0 }, // dirt TL
    { x: 1, y: 0, bits: 0 }, // dirt T
    { x: 2, y: 0, bits: 0 }, // dirt TR
    { x: 0, y: 1, bits: 0 }, // dirt L
    { x: 1, y: 1, bits: 0 }, // dirt 
    { x: 2, y: 1, bits: 0 }, // dirt R
    { x: 0, y: 2, bits: 0 }, // dirt BL
    { x: 1, y: 2, bits: 0 }, // dirt B
    { x: 2, y: 2, bits: 0 }, // dirt BR
    { x: 1, y: 3, bits: 0 }, // dirt H
    { x: 3, y: 4, bits: 0 }, // dirt V
    { x: 2, y: 3, bits: 0 }, // dirt cap L
    { x: 3, y: 3, bits: 0 }, // dirt cap T
    { x: 0, y: 3, bits: 0 }, // dirt cap R
    { x: 3, y: 5, bits: 0 }, // dirt cap B
    { x: 4, y: 0, bits: 0 }, // dirt spot
    { x: 3, y: 1, bits: 0 }, // dirt tee down
    { x: 3, y: 2, bits: 0 }, // dirt tee up
    { x: 4, y: 1, bits: 0 }, // dirt tee left
    { x: 4, y: 2, bits: 0 }, // dirt tee right
    { x: 0, y: 4, bits: 0 }, // dirt /
    { x: 0, y: 5, bits: 0 }, // dirt \
    { blank: true, bits: 0xFFFFFFFF }, // map boundary
  ],
  tiles: new Array(64*64).fill(0),
  tileSize: 16,
  width: 64,
  height: 64,
  image: assets.images.tileset,
};

const TEE_MATCH = {
  0x1a: 27, // dirt b
  0x4a: 28, // dirt r
  0x52: 29, // dirt l
  0x58: 26, // dirt t
};

const CARDINAL_MATCH = {
  0x00: 25, // dirt spot
  0x02: 24, // dirt cap t
  0x08: 21, // dirt cap l
  0x0a: 18, // dirt br
  0x10: 23, // dirt cap r
  0x12: 16, // dirt bl
  0x18: 19, // dirt h
  0x1a: 17, // dirt b
  0x40: 22, // dirt cap b
  0x42: 20, // dirt v
  0x48: 12, // dirt tr
  0x4a: 15, // dirt r
  0x50: 10, // dirt tl
  0x52: 13, // dirt l
  0x58: 11, // dirt t
};

return assets.require('scripts/NoiseField.js').then(([NoiseField]) => {
  const field = new NoiseField(Math.random(), 2, 16);
  for (let sy = 0; sy < 64; sy++) {
    for (let sx = 0; sx < 64; sx++) {
      tilemap.tiles[sy * 64 + sx] = field.valueAt(sx, sy) > 0 ? 14 : 0;
    }
  }

  for (let y = 1; y < 63; y++) {
    for (let x = 1; x < 63; x++) {
      const p = y * 64 + x;
      const t = tilemap.tiles[p];
      if (t != 14) continue;
      // neighbors
      const n = (
        (tilemap.tiles[p - 65] && 0x01) |
        (tilemap.tiles[p - 64] && 0x02) |
        (tilemap.tiles[p - 63] && 0x04) |
        (tilemap.tiles[p - 1]  && 0x08) |
        (tilemap.tiles[p + 1]  && 0x10) |
        (tilemap.tiles[p + 63] && 0x20) |
        (tilemap.tiles[p + 64] && 0x40) |
        (tilemap.tiles[p + 65] && 0x80)
      );
      // cardinal neighbors
      const c = n & 0x5a;
      tilemap.tiles[p] = (n & 0xa5 ? 0 : TEE_MATCH[c]) || CARDINAL_MATCH[c] || 14;
    }
  }

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

  for (let i = 0; i < 64; i++) {
    tilemap.tiles[i * 64] = tilemap.tileTypes.length - 1;
    tilemap.tiles[i * 64 + 63] = tilemap.tileTypes.length - 1;
    tilemap.tiles[i] = tilemap.tileTypes.length - 1;
    tilemap.tiles[4032 + i] = tilemap.tileTypes.length - 1;
  }

  return tilemap;
});
