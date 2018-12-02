"use strict";

// Vertex choices for gradient
const grad3 = [
  new Point(1, 1),
  new Point(-1, 1),
  new Point(1, 0),
  new Point(-1, 0),
  new Point(0, 1),
  new Point(0, -1),
];

// Symbolic math constants
const sqrt3 = Math.sqrt(3.0);
const F2 = 0.5 * (sqrt3 - 1.0);
const G2 = (3.0 - sqrt3) / 6.0;
const G2_2 = G2 + G2 - 1.0;

// Cached point objects to avoid garbage
const p0 = new Point(0, 0);
const p1 = new Point(0, 0);
const p2 = new Point(0, 0);

class NoiseField {
  constructor(seed, octaves = 1, scale = 32.0, depth = 7000.0) {
    this.seed = ((seed > 0 && seed < 1) ? (seed * 0xFFFFFFFF) : seed) | 0;
    this.octaves = octaves;
    this.scale = 1.0 / scale;
    this.depth = depth;
  }

  valueAt(x, y) {
    let result = 0;
    let oScale = this.scale;
    let oDepth = this.depth;
    for (let i = 0; i < this.octaves; i++) {
      result += NoiseField.noise(x, y, this.seed + i, oScale) * oDepth;
      oScale *= 0.5;
      oDepth *= 0.5;
    }
    return result;
  }

  // This function is derived from the definition of simplex noise
  static noise(xin, yin, seed, scale = 1.0) {
    xin *= scale;
    yin *= scale;

    // skew input space
    const s = (xin + yin) * F2;
    const i = (xin + s) | 0;
    const j = (yin + s) | 0;
    const t = (i + j) * G2;

    // unskew first vertex
    p0[0] = xin - (i - t); 
    p0[1] = yin - (j - t);

    // unskew central vertex, which might be above or below the others
    let i1, j1;
    if (p0[0] > p0[1]) {
      p1[0] = p0[0] + G2 - 1.0;
      p1[1] = p0[1] + G2;
      i1 = 1;
      j1 = 0;
    } else {
      p1[0] = p0[0] + G2;
      p1[1] = p0[1] + G2 - 1.0;
      i1 = 0;
      j1 = 1;
    }

    // unskew last vertex
    p2[0] = p0[0] + G2_2;
    p2[1] = p0[1] + G2_2;

    let result = 0;

    // calculate pseudorandom contributions from 3 corners
    let t0 = 0.5 - p0.magnitude;
    if(t0 > 0) {
      const gi0 = NoiseField.seedJenkins96(i, j, seed) % 6;
      t0 *= t0;
      result += t0 * t0 * grad3[gi0].dot(p0);
    }

    let t1 = 0.5 - p1.magnitude;
    if(t1 > 0) {
      const gi1 = NoiseField.seedJenkins96(i + i1, j + j1, seed) % 6;
      t1 *= t1;
      result += t1 * t1 * grad3[gi1].dot(p1);
    }

    let t2 = 0.5 - p2.magnitude;
    if(t2 > 0) {
      const gi2 = NoiseField.seedJenkins96(i + 1, j + 1, seed) % 6;
      t2 *= t2;
      result += t2 * t2 * grad3[gi2].dot(p2);
    }

    return result;
  }

  // This function is derived from the Jenkins96 hash function.
  // It is augmented to be used as a seeded, two-dimensional PRNG.
  static seedJenkins96(x, y, seed)
  {
    let a = (0x9e3779b9 + x) | 0;
    let b = (0x9e3779b9 + y) | 0;
    let c = seed | 0;

    a -= b; a -= c; a ^= (c>>13); 
    b -= c; b -= a; b ^= (a<<8); 
    c -= a; c -= b; c ^= (b>>13); 
    a -= b; a -= c; a ^= (c>>12);  
    b -= c; b -= a; b ^= (a<<16); 
    c -= a; c -= b; c ^= (b>>5); 
    a -= b; a -= c; a ^= (c>>3);  
    b -= c; b -= a; b ^= (a<<10); 
    c -= a; c -= b; c ^= (b>>15); 

    c += 12;

    a -= b; a -= c; a ^= (c>>13);
    b -= c; b -= a; b ^= (a<<8);
    c -= a; c -= b; c ^= (b>>13);
    a -= b; a -= c; a ^= (c>>12);
    b -= c; b -= a; b ^= (a<<16);
    c -= a; c -= b; c ^= (b>>5);
    a -= b; a -= c; a ^= (c>>3);
    b -= c; b -= a; b ^= (a<<10);
    c -= a; c -= b; c ^= (b>>15);

    c &= 0xFFFFFFFF;
    if (c < 0) {
      return c + 0xFFFFFFFF;
    } else {
      return c;
    }
  }
};

return NoiseField;
