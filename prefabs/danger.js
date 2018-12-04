"use strict";

const vectorCache = new Point(0, 0);

return {
  label: 'danger',
  hitboxes: [new Hitbox(0, 0, 0, 0, 0)],
  defaultIsAnimating: true,
  defaultAnimationName: 'default',
  isTrigger: true,
  isPassive: true,
  animations: {
    default: new AnimationSequence([
      new AnimationFrame(assets.images.sprites, 64, 80, 16, 16),
      new AnimationFrame(assets.images.sprites, 80, 80, 16, 16),
    ], 100.0),
  },

  start() {
    this.hidden = true;
    this.alarms = [];
  },

  update(scene, ms) {
    for (let i = this.alarms.length - 1; i >= 0; --i) {
      this.alarms[i].timer -= ms;
      if (this.alarms[i].timer < 0) {
        this.alarms.splice(i, 1);
      }
    }
    
    this.hidden = !this.alarms.length;
  },

  render(camera) {
    if (!this.hidden) Sprite.prototype.render.call(this, camera);

    const pixelRect = this.pixelRect;
    const px = (pixelRect[0] + pixelRect[2]) * .5;
    const py = (pixelRect[1] + pixelRect[3]) * .5 + 16;

    const layer = camera.layers[this.layer];
    layer.lineCap = 'round';
    layer.setLineDash([1, 3]);
    for (const alarm of this.alarms) {
      const fraction = alarm.target.health / alarm.target.maxHealth;
      layer.strokeStyle = `hsla(${fraction * 120},100%,50%,${alarm.timer / 750.0 + .25})`;

      vectorCache[0] = alarm.target.origin[0] - hero.origin[0];
      vectorCache[1] = alarm.target.origin[1] - hero.origin[1];
      vectorCache.normalize();

      layer.lineWidth = 1.5;
      layer.beginPath();
      layer.moveTo(px + vectorCache[0] * 24, py + vectorCache[1] * 24);
      layer.lineTo(px + vectorCache[0] * 36, py + vectorCache[1] * 36); 
      layer.stroke();
      layer.lineWidth = 3;
      layer.beginPath();
      layer.moveTo(px + vectorCache[0] * 24, py + vectorCache[1] * 24);
      layer.lineTo(px + vectorCache[0] * 30, py + vectorCache[1] * 30); 
      layer.stroke();
    }
    layer.setLineDash([]);
  },
};
