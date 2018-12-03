"use strict";
// import Sprite from './Sprite';

// Higher numbers use more GPU memory/bandwidth but fewer GPU operations
// 512 is a decent balance on mobile. Desktop can afford to go higher but
// there's almost never a reason to go over 2048.
const MAX_TEXTURE_SIZE = 512;

class TileMap extends Sprite {
  constructor(config = {}, origin = null) {
    config.hitboxes = config.hitboxes || [new Hitbox(0, 0, config.width, config.height)];
    super(config, origin);
    this.isTileMap = true;
    this.isPassive = true;
    this.width = config.width | 0;
    this.height = config.height | 0;
    this.tileSize = (config.tileSize || PIXELS_PER_UNIT) | 0;
    this.tilesPerUnit = PIXELS_PER_UNIT / this.tileSize;
    this.unitsPerTile = this.tileSize * UNITS_PER_PIXEL;
    this.image = config.image;
    this._hitboxes[0][2] *= this.unitsPerTile;
    this._hitboxes[0][3] *= this.unitsPerTile;

    const tilesPerChunk = (MAX_TEXTURE_SIZE / this.tileSize) | 0;

    // The dimensions of each cache chunk, in tiles
    this.hChunkSize = (this.width < tilesPerChunk ? this.width : tilesPerChunk) | 0;
    this.hLastChunk = (this.width % this.hChunkSize) || this.hChunkSize;
    this.vChunkSize = (this.height < tilesPerChunk ? this.height : tilesPerChunk) | 0;
    this.vLastChunk = (this.height % this.vChunkSize) || this.vChunkSize;

    // The number of cache chunks necessary to cover the tilemap
    this.hChunks = Math.ceil(this.width / this.hChunkSize) | 0;
    this.vChunks = Math.ceil(this.height / this.vChunkSize) | 0;

    // Either copy in the existing tile data, or allocate new memory
    this.tileBits = new Int32Array(config.tileBits || (this.width * this.height));
    this.tiles = new (config.tileTypes.length < 256 ? Uint8Array : Uint16Array)(config.tiles || (this.width * this.height));
    this.tileTypes = config.tileTypes;

    // Allocate memory for all of the chunks
    this.chunks = [];
    for (let i = 0; i < this.vChunks; i++) {
      const row = [];
      const chunkHeight = (i == this.vChunks - 1) ? this.vLastChunk : this.vChunkSize;
      for (let j = 0; j < this.hChunks - 1; j++) {
        row.push({ valid: false, canvas: null, height: chunkHeight, width: this.hChunkSize });
      }
      row.push({ valid: false, canvas: null, height: chunkHeight, width: this.hLastChunk });
      this.chunks.push(row);
    }

    // For collision to work, either config.tileBits or config.tileTypes must be set
    if (!config.tileBits) {
      this.updateTiles();
    }
  }

  bitsAt(x, y) {
    if (y === undefined) {
      y = x[1];
      x = x[0];
    }
    let tx = (x - this._origin[0]) * this.tilesPerUnit;
    let ty = (y - this._origin[1]) * this.tilesPerUnit;
    if (tx < 0 || ty < 0) return 0;
    tx |= 0;
    ty |= 0;
    if (tx >= this.width || ty >= this.height) return 0;
    return this.tileBits[ty * this.width + tx];
  }

  computeCollision(other, fast) {
    const otherHitboxes = other.hitboxes;
    const otherLen = otherHitboxes.length;
    const otherHitbox = TileMap._tempRect;
    const cc = Sprite._collisionCache;
    if (!fast) {
      cc.velocities[0][0] = 0;
      cc.velocities[0][1] = 0;
      cc.speeds[0] = 0;
      cc.velocities[1].set(other._velocity);
      cc.speeds[1] = other._velocity.magnitude;
      cc.velocity[0] = -other._velocity[0];
      cc.velocity[1] = -other._velocity[1];
      cc.speed = cc.speeds[1];
    }
    let i, x, y, xi, yi, bits, pen;
    let minPenSquared = Infinity;
    for (i = 0; i < otherLen; ++i) {
      bits = otherHitboxes[i].bits;
      otherHitboxes[i].translateInto(otherHitbox, other._origin);
      otherHitbox.translateXY(-this._origin[0], -this._origin[1]);
      if (!fast) {
        otherHitbox.translateInto(TileMap._prevHitbox, cc.velocity);
        TileMap._hSweep.setCoords(
          otherHitbox[0], TileMap._prevHitbox[1],
          otherHitbox[2], TileMap._prevHitbox[3],
        );
      }
      // The -1 on the vertical coordinates is to accommodate the fact
      // that tiles span from y to y-1, since the coordinate systems
      // are different. TODO: Consider changing this.
      let ox = (otherHitbox[0] * this.tilesPerUnit) | 0;
      if (ox < 0) ox = 0;
      if (ox >= this.width) continue;
      let oy = (otherHitbox[1] * this.tilesPerUnit - 1) | 0;
      if (oy < 0) oy = 0;
      if (oy >= this.height) continue;
      let oxMax = (otherHitbox[2] * this.tilesPerUnit) | 0;
      if (oxMax >= this.width) oxMax = this.width - 1;
      if (oxMax < 0) continue;
      let oyMax = (otherHitbox[3] * this.tilesPerUnit - 1) | 0;
      if (oyMax >= this.height) oyMax = this.height - 1;
      if (oyMax < 0) continue;
      cc.penetration[0] = 0;
      cc.penetration[1] = 0;
      for (y = oy; y <= oyMax; y++) {
        const row = y * this.width;
        for (x = ox; x <= oxMax; x++) {
          if (bits & this.tileBits[row + x]) {
            if (fast) return true;
            TileMap._tileBox.setXySize(
              x * this.unitsPerTile, (y + 1) * this.unitsPerTile,
              this.unitsPerTile, this.unitsPerTile,
            );
            if (other._velocity[0] > 0 && TileMap._tileBox.intersects(TileMap._hSweep)) {
              // Moving right intersects this tile
              cc.penetration[0] = TileMap._hSweep[2] - TileMap._tileBox[0];
            } else if (other._velocity[0] < 0 && TileMap._tileBox.intersects(TileMap._hSweep)) {
              // Moving left intersects this tile
              cc.penetration[0] = TileMap._hSweep[0] - TileMap._tileBox[2];
            }
            // Adjust the vertical sweep to the constrained horizontal position
            TileMap._vSweep.setCoords(
              TileMap._prevHitbox[0] + cc.penetration[0], otherHitbox[1],
              TileMap._prevHitbox[2] + cc.penetration[0], otherHitbox[3],
            );
            if (other._velocity[1] > 0 && TileMap._tileBox.intersects(TileMap._vSweep)) {
              // Moving down intersects this tile
              cc.penetration[1] = TileMap._vSweep[3] - TileMap._tileBox[1];
            } else if (other._velocity[1] < 0 && TileMap._tileBox.intersects(TileMap._vSweep)) {
              // Moving up intersects this tile
              cc.penetration[1] = TileMap._vSweep[1] - TileMap._tileBox[3];
            }
          }
        }
      }
      if (cc.penetration[0] || cc.penetration[1]) return cc;
    }
    return false;
  }

  updateTiles() {
    let x, y;
    for (y = 0; y < this.vChunks; y++) {
      const row = this.chunks[y];
      const chunkHeight = (y == this.vChunks - 1) ? this.vLastChunk : this.vChunkSize;
      for (x = 0; x < this.hChunks; x++) {
        const chunk = row[x];
        chunk.valid = false;
        if (!chunk.canvas) {
          chunk.canvas = document.createElement('CANVAS');
          chunk.canvas.setAttribute('width', chunk.width * this.tileSize);
          chunk.canvas.setAttribute('height', chunk.height * this.tileSize);
          chunk.context = chunk.canvas.getContext('2d');
          chunk.context.imageSmoothingEnabled = false;
        }
      }
    }

    for (y = 0; y < this.height; y++) {
      const row = y * this.width;
      for (x = 0; x < this.width; x++) {
        this.tileBits[row + x] = this.tileTypes[this.tiles[row + x]].bits;
      }
    }
  }

  getChunk(chunkX, chunkY) {
    const chunkData = this.chunks[chunkY][chunkX];
    const srcData = this.image.data;
    if (!chunkData.valid) {
      chunkData.valid = true;
      chunkData.context.clearRect(0, 0, chunkData.width * this.tileSize, chunkData.height * this.tileSize);
      for (let y = 0; y < chunkData.height; y++) {
        const tileRow = (chunkY * this.vChunkSize + y) * this.width + chunkX * this.hChunkSize;
        const pixelRow = y * this.tileSize;
        for (let x = 0; x < chunkData.width; x++) {
          const tileType = this.tileTypes[this.tiles[tileRow + x]];
          if (!tileType || tileType.blank) continue;
          chunkData.context.drawImage(this.image,
            tileType.x * this.tileSize, tileType.y * this.tileSize, this.tileSize, this.tileSize,
            x * this.tileSize, pixelRow, this.tileSize, this.tileSize,
          );
        }
      }
    }
    return chunkData;
  }

  render(camera) {
    for (let y = 0; y < this.vChunks; y++) {
      const oy = this._origin[1] * PIXELS_PER_UNIT + y * this.vChunkSize * this.tileSize;
      for (let x = 0; x < this.hChunks; x++) {
        const chunk = this.getChunk(x, y);
        camera.layers[this.layer].drawImage(chunk.canvas, this._origin[0] * PIXELS_PER_UNIT + x * this.hChunkSize * this.tileSize, oy);
      }
    }
  }
}

TileMap._tempRect = new Rect(0, 0, 0, 0);

TileMap._workCanvas = (() => {
  const canvas = document.createElement('CANVAS');
  canvas.setAttribute('width', MAX_TEXTURE_SIZE);
  canvas.setAttribute('height', MAX_TEXTURE_SIZE);
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  return context;
})();

TileMap._tileBox = new Rect(0, 0, 0, 0);
TileMap._prevHitbox = new Rect(0, 0, 0, 0);
TileMap._hSweep = new Rect(0, 0, 0, 0);
TileMap._vSweep = new Rect(0, 0, 0, 0);
