"use strict";

function cropImage(imageData, sx, sy, sw, sh) {
  const canvas = document.createElement('CANVAS');
  canvas.width = sw;
  canvas.height = sh;
  canvas.style.display = 'none';
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageData, -sx - .5, -sy - .5);
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

function flipImage(image, flipX, flipY) {
  if (!flipX && !flipY) return image;
  const flipKey = 'flipped' + (flipX ? 'X' : '') + (flipY ? 'Y' : '');
  if (image[flipKey]) return image[flipKey];
  const canvas = document.createElement('CANVAS');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.style.display = 'none';
  const ctx = canvas.getContext('2d');
  ctx.translate(flipX ? image.width : 0, flipY ? image.height : 0);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(image, 0, 0);
  const img = new Image();
  img.src = canvas.toDataURL();
  image[flipKey] = img;
  return img;
}

class AssetStore {
  constructor() {
    this.images = {};
    this.prefabs = {};
  }

  loadImageAssets(assets) {
    return Promise.all(Object.keys(assets).map(key => this.loadImageAsset(key, assets[key]))).then(() => this);
  }

  loadImageAsset(key, url) {
    if (this.images[key]) {
      return Promise.resolve(this.images[key]);
    }
    const element = document.createElement('IMG');
    element.style.display = 'none';
    return new Promise((resolve, reject) => {
      element.addEventListener('load', () => resolve(this.images[key] = element));
      element.addEventListener('error', e => reject(e));
      element.src = url;
    }).then(data => this.images[key] = data);
  }

  loadPrefabAssets(assets) {
    return Promise.all(Object.keys(assets).map(key => this.loadPrefabAsset(key, assets[key]))).then(() => this);
  }

  loadPrefabAsset(key, url) {
    if (this.prefabs[key]) {
      return Promise.resolve(this.prefabs[key]);
    }
    this.prefabs[key] = fetch(url).then(response => response.text()).then(js => {
      return this.prefabs[key] = (new Function('assets', js))(this);
    });
    return this.prefabs[key];
  }
}
