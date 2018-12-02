"use strict";

return {
  label: 'altar',
  isPassive: true,
  hitboxes: [new Hitbox(-.43, -.43, .43, 0, 0xFFFFFFFF)],
  animations: {
    default: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 16, 112, 26, 19),
    ]),
  },
  onCollisionStart(other, coll) {
    this.onCollisionStay(other, coll);
  },
  onCollisionStay(other, coll) {
    // TODO: cutting corners diagonally is super glitchy
    const px2 = coll.penetration[0] * coll.penetration[0];
    const py2 = coll.penetration[1] * coll.penetration[1];
    const h1 = Sprite._tempRect1;
    this.hitbox.translateInto(h1, this._origin);
    const h2 = Sprite._tempRect2;
    other.hitbox.translateInto(h2, other._origin);
    if (px2 > py2) {
      if (coll.velocity[0] > 0) {
        other.move(h1[2] - h2[0], 0);
      } else if (coll.velocity[0] < 0) {
        other.move(h1[0] - h2[2], 0);
      }
    } else {
      if (coll.velocity[1] > 0) {
        other.move(0, h1[3] - h2[1]);
      } else if (coll.velocity[1] < 0) {
        other.move(0, h1[1] - h2[3]);
      }
    }
  },
};
