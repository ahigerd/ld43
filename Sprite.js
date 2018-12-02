"use strict";
// import Point from './Point';
// import Rect from './Rect';

class Hitbox extends Rect {
  constructor(p1, p2, p3, p4, p5) {
    if (p4 !== undefined) {
      super(p1, p2, p3, p4);
      this.bits = p5 === undefined ? 0xFFFFFFFF : p5;
    } else if (p2 && p2.length) {
      super(p1, p2);
      this.bits = p3 === undefined ? 0xFFFFFFFF : p3;
    } else {
      super(p1);
      this.bits = p2 === undefined ? 0xFFFFFFFF : p2;
    }
  }

  intersects(other) {
    if (this.bits !== undefined && other.bits !== undefined && !(this.bits & other.bits)) {
      return false;
    }
    return super.intersects(other);
  }
}

/**
 * A representation of a single frame of an animation.
 */
class AnimationFrame extends Rect {
  /**
   * Creates a new animation frame by cropping an image.
   * @param {???} The sprite sheet.
   * @param {Number=} Left side of sprite, in pixels. (Default 0)
   * @param {Number=} Top side of sprite, in pixels. (Default 0)
   * @param {Number=} Width of sprite, in pixels. (Default to whole image)
   * @param {Number=} Height of sprite, in pixels. (Default to whole image)
   * @param {Point=} Position of the origin inside the sprite, in world units.
   *                 (Default to bottom center)
   * @param {Hitbox[]=} The hitboxes for this frame relative to the origin.
   *                 (Default to one hitbox covering the whole image)
   */
  constructor(image, x = 0, y = 0, w = null, h = null, origin = null, hitboxes = null) {
    w = w || image.width;
    h = h || image.height;
    const flipX = w < 0;
    const flipY = h < 0;
    if (w < 0) w = -w;
    if (h < 0) h = -h;
    const widthUnits = w * UNITS_PER_PIXEL;
    const heightUnits = h * UNITS_PER_PIXEL;
    if (!origin) {
      // If the origin isn't specified, default it to bottom center
      origin = [widthUnits * 0.5, heightUnits];
    }
    super(-origin[0], -origin[1], widthUnits - origin[0], heightUnits - origin[1]);
    this._sizePixels = new IntPoint(w, h);
    this._origin = new Point(origin);
    this._originPixels = new IntPoint((origin[0] * PIXELS_PER_UNIT)|0, (origin[1] * PIXELS_PER_UNIT)|0);
    if (hitboxes) {
      this.hitboxes = hitboxes;
    } else {
      this.hitboxes = [new Hitbox(-origin[0], -origin[1], widthUnits - origin[0], heightUnits - origin[1])];
    }
    this.imageData = flipImage(image, flipX, flipY);
    this.imageBounds = new Int32Array(4);
    this.imageBounds[0] = (flipX ? image.width - x - w : x);
    this.imageBounds[1] = y;
    this.imageBounds[2] = w;
    this.imageBounds[3] = h;
  }

  get origin() {
    return this._origin;
  }

  set origin(other) {
    this._origin.set(other);
  }
}

/**
 * A representation of a series of frames forming an animation.
 */
class AnimationSequence {
  /**
   * Creates a new animation sequence from a set of frames.
   * @param {AnimationFrame[]} The set of frames to be rendered.
   * @param {Number=} The duration of each frame. (Default 60fps)
   */
  constructor(frames, frameMS = 1000.0 / 60.0) {
    this.frames = frames;
    this.frameMS = frameMS;
    this.msPerFrame = 1 / frameMS;
  }

  /**
   * Returns the total duration of the animation, in milliseconds.
   */
  get duration() {
    return this.frames.length * this.frameMS;
  }

  /**
   * Returns the number of frames in the animation.
   */
  get length() {
    return frames.length;
  }

  /**
   * Returns the frame to be rendered at the specified number of milliseconds
   * into the animation.
   * @param {Number} The elapsed time.
   * @returns {AnimationFrame} The frame to render.
   */
  frameAt(ms) {
    return this.frames[(ms * this.msPerFrame) | 0];
  }
}

/**
 * A renderable object that can be added to a scene.
 */
class Sprite {
  constructor(config = {}, origin = null) {
    this.label = config.label || null;
    this._origin = new Point(origin || config.origin || [0, 0]);
    this._hitboxes = config.animateHitboxes ? null : (config.hitboxes || [new Hitbox(-.5, -.5, .5, .5)]);
    this.currentAnimationName = config.defaultAnimationName || 'default';
    this.animations = config.animations || {};
    this.animateHitboxes = config.animateHitboxes || false;
    this.layer = config.layer || 0;
    this.isTrigger = config.isTrigger || false;
    this.isPassive = config.isPassive || false;

    for (const method of ['update', 'start', 'onCollisionEnter', 'onCollisionStay', 'onCollisionExit', 'render']) {
      if (config[method]) {
        this[method] = config[method];
      }
    }

    const currentAnimation = this.currentAnimation;
    this.currentFrame = currentAnimation ? currentAnimation.frameAt(0) : null;
    this.isAsleep = false;
    this.lastAabb = null;
    this.lastHitboxes = [];
    this.isAnimating = config.defaultIsAnimating;
    this.animationTime = 0;
    this.oneShotName = null;
    this.scene = null;

    // An array is 25% faster than a Set here.
    // this._coarseCollisions = [];
    // But in Chrome 67, [].includes doesn't consistently work with reference identity
    this._coarseCollisions = new Set();
    // A Map with object-valued keys is 4% faster than maintaining numeric IDs and using a plain object.
    this._collisions = new Map();

    this._pixelRect = new IntRect(0, 0, 0, 0);
    this._sweepCollisions = false;
    this._lastOrigin = new Point(0, 0);
    this._velocity = new Point(0, 0);
  }

  computeBoxes() {
    const hitboxes = this.hitboxes;
    const len = hitboxes.length;
    if (this.lastAabb) {
      this.lastAabb.set(this.currentFrame || this.hitbox);
    } else {
      this.lastAabb = new Rect(this.currentFrame || this.hitbox);
    }
    this.lastAabb.translate(this._origin);
    if (this.lastHitboxes.length > len) {
      this.lastHitboxes.length = len;
    } else {
      while (this.lastHitboxes.length < len) {
        this.lastHitboxes.push(new Hitbox(0, 0, 0, 0));
      }
    }
    for (let i = 0; i < len; i++) {
      hitboxes[i].translateInto(this.lastHitboxes[i], this._origin);
      this.lastHitboxes[i].bits = hitboxes[i].bits;
      this.lastAabb.union(this.lastHitboxes[i]);
    }
  }

  get hitboxes() {
    if (this.animateHitboxes) {
      return this.currentFrame.hitboxes;
    }
    return this._hitboxes;
  }

  get hitbox() {
    return this.hitboxes[0];
  }

  set hitbox(other) {
    this.hitboxes[0].set(other);
  }

  get origin() {
    return this._origin;
  }

  set origin(other) {
    this._origin.set(other);
  }

  get pixelRect() {
    const frame = this.currentFrame || this.hitbox;
    this._pixelRect[0] = (this._origin[0] * PIXELS_PER_UNIT - frame._originPixels[0])|0;
    this._pixelRect[1] = (this._origin[1] * PIXELS_PER_UNIT - frame._originPixels[1])|0;
    this._pixelRect[2] = this._pixelRect[0] + frame._sizePixels[0];
    this._pixelRect[3] = this._pixelRect[1] + frame._sizePixels[1];
    return this._pixelRect;
  }

  get isOneShotPlaying() {
    return !!this.oneShotName;
  }

  get currentAnimation() {
    if (this.oneShotName) {
      return this.animations[this.oneShotName];
    }
    return this.animations[this.currentAnimationName];
  }

  setAnimation(name, play = true) {
    if (this.currentAnimationName !== name) {
      this.currentAnimationName = name;
      this.animationTime = 0;
      this.currentFrame = this.currentAnimation.frameAt(0);
    }
    this.isAnimating = play;
  }

  playOneShot(name) {
    this.oneShotName = name;
    this.animationTime = 0;
  }

  internalUpdate(scene, ms) {
    if (this.isAnimating || this.oneShotName) {
      let animation = this.currentAnimation;
      this.animationTime += ms;
      while (this.animationTime > animation.duration) {
        if (this.oneShotName) {
          this.oneShotName = null;
          this.animationTime = 0;
          animation = this.currentAnimation;
        } else {
          this.animationTime -= animation.duration;
        }
      }
      this.currentFrame = animation.frameAt(this.animationTime);
    }
    this._lastOrigin.set(this._origin);
    this._moved = false;
    this._sweepCollisions = false;
    this.update(scene, ms);
  }

  update(scene, ms) {
    // By default, sprites have no update behavior.
    // Subclasses should override this.
  }

  start(scene) {
    // By default, sprites have no start behavior.
    // Subclasses may override this.
  }

  /*
  onCollisionEnter(other) {
    // By default, sprites have no collision behavior.
    // Subclasses may override this.
  }

  onCollisionStay(other) {
    // By default, sprites have no collision behavior.
    // Subclasses may override this.
  }

  onCollisionExit(other) {
    // By default, sprites have no collision behavior.
    // Subclasses may override this.
  }
  */

  render(camera) {
    const frame = this.currentFrame;
    if (frame && frame.imageData) {
      //commonRender.call(this, camera);
      camera.layers[this.layer].drawImage(
        frame.imageData,
        frame.imageBounds[0],
        frame.imageBounds[1],
        frame.imageBounds[2],
        frame.imageBounds[3],
        (this._origin[0] * PIXELS_PER_UNIT - frame._originPixels[0])|0,
        (this._origin[1] * PIXELS_PER_UNIT - frame._originPixels[1])|0,
        frame.imageBounds[2],
        frame.imageBounds[3],
      );
    }
  }

  computeCollision(other, fast) {
    if (other.isTileMap) {
      // TileMap-Sprite collisions should be handled by TileMap's code, so delegate the calculation.
      return other.computeCollision(this, fast);
    }

    const cc = Sprite._collisionCache;
    let slope;
    if (!fast) {
      cc.velocities[0].set(this._velocity);
      cc.speeds[0] = this._velocity.magnitude;

      cc.velocities[1].set(other._velocity);
      cc.speeds[1] = other._velocity.magnitude;

      cc.velocity[0] = this._velocity[0] - other._velocity[0];
      cc.velocity[1] = this._velocity[1] - other._velocity[1];
      cc.speed = cc.velocity.magnitude;

      const normX = cc.velocity[0] / cc.speed;
      const normY = cc.velocity[1] / cc.speed;
      slope = normY / normX;
    }

    const hitboxes = this.hitboxes;
    const otherHitboxes = other.hitboxes;
    const len = hitboxes.length;
    const otherLen = otherHitboxes.length;
    const hitbox = Sprite._tempRect1;
    const otherHitbox = Sprite._tempRect2;

    let hMag = 0, vMag = 0, penX, penY, penSquared, minPenSquared = Infinity;
    let hMag1, hMag2, vMag1, vMag2, i, j;
    for (i = 0; i < len; ++i) {
      hitboxes[i].translateInto(hitbox, this._origin);
      hitbox.bits = hitboxes[i].bits;
      for (j = 0; j < otherLen; ++j) {
        otherHitboxes[j].translateInto(otherHitbox, other._origin);
        otherHitbox.bits = otherHitboxes[j].bits;
        if (!hitbox.intersects(otherHitbox)) {
          continue;
        }

        if (fast || this.isTrigger || other.isTrigger) return true;

        hMag1 = hitbox[2] - otherHitbox[0];
        hMag2 = otherHitbox[2] - hitbox[0];
        hMag = hMag1*hMag1 < hMag2*hMag2 ? hMag1 : hMag2;
        vMag1 = hitbox[3] - otherHitbox[1];
        vMag2 = otherHitbox[3] - hitbox[1];
        vMag = vMag1*vMag1 < vMag2*vMag2 ? vMag1 : vMag2;

        if (hMag * hMag < vMag * vMag) {
          penX = hMag;
          penY = penX * slope;
        } else {
          penY = vMag;
          penX = penY / slope;
        }
        penSquared = (penX * penX) + (penY * penY);

        if (minPenSquared > penSquared) {
          cc.penetration[0] = penX;
          cc.penetration[1] = penY;
          cc.hitboxes[0] = hitboxes[i];
          cc.hitboxes[1] = otherHitboxes[j];
          minPenSquared = penSquared;
          const magCompare = hMag > vMag ? hMag - vMag : vMag - hMag;
          if (magCompare < 0.01) {
            // TODO: Figure out a better way to scale this ambiguous corner calculation
            cc.normal[0] = cc.velocity[0] > 0 ? -1 : 1;
            cc.normal[1] = cc.velocity[1] > 0 ? -1 : 1;
          } else if (hMag < vMag) {
            cc.normal[0] = cc.velocity[0] > 0 ? -1 : 1;
            cc.normal[1] = 0;
          } else {
            cc.normal[0] = 0;
            cc.normal[1] = cc.velocity[1] > 0 ? -1 : 1;
          }
        }
      }
    }
    return minPenSquared !== Infinity ? cc : false;
  }

  move(dx, dy, sweep = false) {
    // Triggers don't need to mark themselves as moving
    if (!this.isTrigger) {
      this._moved = true;
      this._sweepCollisions = this._sweepCollisions || sweep;
    }
    this._origin[0] += dx;
    this._origin[1] += dy;
  }
}

// Pre-allocated storage for computations to avoid generating garbage
Sprite._tempRect1 = new Hitbox(0, 0, 0, 0);
Sprite._tempRect2 = new Hitbox(0, 0, 0, 0);
Sprite._collisionCache = {
  velocity: new Point(0, 0),
  speed: 0,
  normal: new Point(0, 0),
  penetration: new Point(0, 0),
  contact: [new Point(0, 0), new Point(0, 0)],
  hitboxes: [new Hitbox(0, 0, 0, 0, 0), new Hitbox(0, 0, 0, 0, 0)],
  velocities: [new Point(0, 0), new Point(0, 0)],
  speeds: [0, 0],
  invert: function() {
    this.velocity.invert();
    this.normal.invert();
    this.penetration.invert();
    this.speed = -this.speed;

    let t = this.hitboxes[1];
    this.hitboxes[1] = this.hitboxes[0];
    this.hitboxes[0] = t;

    t = this.contact[1];
    this.contact[1] = this.contact[0];
    this.contact[0] = t;

    t = this.speeds[1];
    this.speeds[1] = this.speeds[0];
    this.speeds[0] = t;

    t = this.velocities[1];
    this.velocities[1] = this.velocities[0];
    this.velocities[0] = t;
  },
};

