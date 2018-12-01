"use strict";

class TouchControls {
  constructor(dpadContainer, buttonContainer, pauseContainer, buttons = []) {
    if (dpadContainer) {
      this.dpadContainer = dpadContainer;
      dpadContainer.classList.add('dpad');
      this._up = this.addButton(dpadContainer, 'up', '&uarr;', 'ArrowUp');
      this._left = this.addButton(dpadContainer, 'left', '&larr;', 'ArrowLeft');
      this._right = this.addButton(dpadContainer, 'right', '&rarr;', 'ArrowRight');
      this._down = this.addButton(dpadContainer, 'down', '&darr;', 'ArrowDown');
      dpadContainer.addEventListener('mousedown', (event) => this._touchDpad(event, true));
      dpadContainer.addEventListener('mousemove', (event) => this._touchDpad(event, event.buttons));
      dpadContainer.addEventListener('mouseout', (event) => this._touchDpad(event, false));
      dpadContainer.addEventListener('mouseup', (event) => this._touchDpad(event, false));
      dpadContainer.addEventListener('touchstart', (event) => this._touchDpad(event, true));
      dpadContainer.addEventListener('touchmove', (event) => this._touchDpad(event, true));
      dpadContainer.addEventListener('touchend', (event) => this._touchDpad(event, false));
    }

    if (buttonContainer) {
      this.buttonContainer = buttonContainer;
      buttonContainer.classList.add('buttons');
      for (const button of buttons) {
        let buttonElement;
        if (typeof button === 'string') {
          buttonElement = this.addButton(buttonContainer, 'button', button, button);
        } else {
          buttonElement = this.addButton(buttonContainer, 'button', button.label, button.key);
        }
        buttonElement.addEventListener('mousedown', () => this._touchButton(event, buttonElement, true));
        buttonElement.addEventListener('mouseout', () => this._touchButton(event, buttonElement, false));
        buttonElement.addEventListener('mouseup', () => this._touchButton(event, buttonElement, false));
        buttonElement.addEventListener('touchstart', () => this._touchButton(event, buttonElement, true));
        buttonElement.addEventListener('touchend', () => this._touchButton(event, buttonElement, false));
      }
    }

    if (pauseContainer) {
      this.pauseContainer = pauseContainer;
      pauseContainer.classList.add('pause');
      this._pauseButton = this.addButton(pauseContainer, 'button', 'Pause', 'Escape');
      this._pauseButton.addEventListener('touchstart', (event) => this._pause(true));
      this._pauseButton.addEventListener('touchend', (event) => this._pause(false));
      this._pauseButton.addEventListener('mousedown', (event) => this._pause(true));
      this._pauseButton.addEventListener('mouseout', (event) => this._pause(false));
      this._pauseButton.addEventListener('mouseup', (event) => this._pause(false));
    }

    // By default, hide the touchscreen controls for devices without a touchscreen.
    // ontouchstart defaults to null for devices with one and undefined for devices without one.
    this.hidden = window.ontouchstart === undefined;
  }

  addButton(container, className, label, key) {
    const button = document.createElement('DIV');
    button.className = className;
    button.innerHTML = label;
    button.key = key;
    container.appendChild(button);
    return button;
  }

  _touchDpad(event, active) {
    event.preventDefault();
    const touches = event.touches || (active ? [{ clientX: event.pageX - window.scrollX, clientY: event.pageY - window.scrollY, identifier: 'mouse' }] : []);
    const rect = this.dpadContainer.getBoundingClientRect();
    const buttonWidth = rect.width / 3;
    const buttonHeight = rect.height / 3;
    const leftX = rect.left + buttonWidth;
    const rightX = rect.right - buttonWidth;
    const upY = rect.top + buttonHeight;
    const downY = rect.bottom - buttonHeight;
    Input.keys.ArrowLeft = false;
    Input.keys.ArrowRight = false;
    Input.keys.ArrowUp = false;
    Input.keys.ArrowDown = false;
    for (const touch of touches) {
      if (touch.clientX < rect.left) continue;
      if (touch.clientX > rect.right) continue;
      if (touch.clientY < rect.top) continue;
      if (touch.clientY > rect.bottom) continue;
      if (touch.clientX < leftX) Input.keys.ArrowLeft = true;
      if (touch.clientX > rightX) Input.keys.ArrowRight = true;
      if (touch.clientY < upY) Input.keys.ArrowUp = true;
      if (touch.clientY > downY) Input.keys.ArrowDown = true;
    }
    this._up.classList.toggle('active', Input.keys.ArrowUp);
    this._left.classList.toggle('active', Input.keys.ArrowLeft);
    this._right.classList.toggle('active', Input.keys.ArrowRight);
    this._down.classList.toggle('active', Input.keys.ArrowDown);
  }

  _touchButton(event, element, active) {
    event.preventDefault();
    element.classList.toggle('active', active);
    Input.keys[element.key] = active;
  }

  _pause(active) {
    Input.keys.Escape = active;
    this._pauseButton.classList.toggle('active', active);
    // Pause needs a special event handler because it is the one action that can
    // fire while the engine is paused. Games will probably want to also bind
    // the actual Escape key for the same reason.
    if (active && this.onPauseClicked) this.onPauseClicked();
  }

  get hidden() {
    return this._hidden;
  }

  set hidden(active) {
    this._hidden = active;
    if (this.dpadContainer) this.dpadContainer.style.display = active ? 'none' : '';
    if (this.pauseContainer) this.pauseContainer.style.display = active ? 'none' : '';
    if (this.buttonContainer) this.buttonContainer.style.display = active ? 'none' : '';
  }
}
