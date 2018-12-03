"use strict";

const Input = {
  keys: {},

  // These are mappings from various nonstandard key names that some browsers produce
  // to the standardized names in the HTML5 specification.
  normalize: {
    'Spacebar': ' ',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    'Down': 'ArrowDown',
    'Up': 'ArrowUp',
    'OS': 'Meta',
    'Scroll': 'ScrollLock',
    'Del': 'Delete',
    'Crsel': 'CrSel',
    'Exsel': 'ExSel',
    'Esc': 'Escape',
    'Apps': 'ContextMenu',
    'Nonconvert': 'NonConvert',
    'MediaNextTrack': 'MediaTrackNext',
    'MediaPreviousTrack': 'MediaTrackPrevious',
    'FastFwd': 'MediaFastForward',
    'VolumeUp': 'AudioVolumeUp',
    'VolumeDown': 'AudioVolumeDown',
    'VolumeMute': 'AudioVolumeMute',
    'SelectMedia': 'LaunchMediaPlayer',
    'MediaSelect': 'LaunchMediaPlayer',
    'LaunchCalculator': 'LaunchApplication1',
    'LaunchMyComputer': 'LaunchApplication2',
    'Add': '+',
    'Decimal': '.',
    'Multiply': '*',
    'Divide': '/',
  },
};

class Engine {
  constructor(options = {}) {
    try {
      this._eventTarget = new EventTarget();
    } catch (e) {
      // MS Edge doesn't support the EventTarget constructor: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/18274176/
      this._eventTarget = document.createElement('DIV');
    }

    this._fpsFrames = 0;
    this._fpsSum = 0;
    this.fpsMeter = document.createElement('DIV');
    this.fpsMeter.style.position = 'absolute';
    this.fpsMeter.style.top = '0px';
    this.fpsMeter.style.right = '0px';
    this.fpsMeter.style.fontFamily = 'monospace';
    this.fpsMeter.style.textAlign = 'right';
    this.fpsMeter.width = '5em';
    this.showFps = options.showFps;

    this.activeScene = options.scene || new Scene();
    this.cameras = [];

    this.timer = null;

    this.tick = this.tick.bind(this);

    for (const method of ['addEventListener', 'removeEventListener', 'dispatchEvent']) {
      this[method] = this._eventTarget[method].bind(this.eventTarget);
    }

    this.eventSource = options.eventSource || window;
    this.eventSource.addEventListener('keydown', event => {
      if (!event.altKey && !event.ctrlKey && !event.metaKey) event.preventDefault();
      const key = Input.normalize[event.key] || event.key;
      Input.keys[key] = true;
      this.dispatchEvent(new CustomEvent('enginekeydown', { detail: { key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey } }));
    });
    this.eventSource.addEventListener('keyup', event => {
      if (!event.altKey && !event.ctrlKey && !event.metaKey) event.preventDefault();
      const key = Input.normalize[event.key] || event.key;
      Input.keys[key] = false;
      this.dispatchEvent(new CustomEvent('enginekeyup', { detail: { key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey } }));
    });
  }

  get showFps() {
    return this._showFps;
  }

  set showFps(on) {
    this._showFps = !!on;
    if (on) {
      document.body.appendChild(this.fpsMeter);
    } else if (this.fpsMeter.parentElement) {
      document.body.removeChild(this.fpsMeter);
    }
  }

  get running() {
    return !!this.timer;
  }

  start() {
    if (this.timer) {
      return;
    }
    this.timer = window.requestAnimationFrame(this.tick);
    this.dispatchEvent(new CustomEvent('enginestart'));
  }

  pause(on = null) {
    if (on === null) {
      on = !this.timer;
    }
    if (on) {
      this.start();
    } else {
      const wasRunning = this.running;
      window.cancelAnimationFrame(this.timer);
      this.timer = null;
      if (wasRunning) this.dispatchEvent(new CustomEvent('enginepause'));
    }
  }

  step(ms = 16) {
    this.pause(false);
    this.tick(ms, true);
  }

  tick(timestamp, stepping) {
    if (this.running && !this._lastTS) {
      this._lastTS = timestamp;
      this.timer = window.requestAnimationFrame(this.tick);
      return;
    }
    if (document.hidden || !document.hasFocus() || document.visibilityState === 'hidden') {
      // Automatically pause the game if the browser loses focus
      this.pause(false);
    }
    let ms;
    if (stepping) {
      ms = timestamp;
      this._lastTS = null;
    } else {
      ms = timestamp - this._lastTS;
      this._lastTS = timestamp;
    }
    const before = performance.now();
    this.activeScene.tick(ms);
    for (let i = 0; i < this.cameras.length; i++) {
      this.cameras[i].render(this.activeScene);
    }
    const after = performance.now();
    if (this.showFps) {
      this._fpsSum += (after - before);
      this._fpsFrames++;
      if (this._fpsFrames > 15 || stepping) {
        const msPerFrame = this._fpsSum / this._fpsFrames;
        this.fpsMeter.innerHTML = (1000.0 / msPerFrame).toFixed(0) + ' fps<br/>' + msPerFrame.toFixed(2) + ' ms';
        this._fpsFrames = 0;
        this._fpsSum = 0;
      }
    }
    if (this.running) {
      this.timer = window.requestAnimationFrame(this.tick);
    } else {
      this.timer = null;
    }
  }
}
