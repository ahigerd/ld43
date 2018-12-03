<!DOCTYPE html>
<html>
<head>
<style>
#step, #pause {
  margin-top: 3em;
  float: right
}
#camera, #loading {
  width: 640px;
  height: 480px;
  border: 1px solid black;
  position: absolute;
  top: 0;
  left: calc(50% - 320px);
}
#loading {
  line-height: 480px;
  text-align: center;
  font-size: 100px;
  font-weight: bold;
  font-family: sans-serif;
  animation: blink .5s infinite;
}
@keyframes blink {
  0% { color: black; }
  50% { color: transparent; }
};
#camera canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated -moz-crisp-edges;
  -webkit-optimize-contrast: pixelated;
}
#pauseContainer {
  position: fixed;
  left: 40%;
  width: 20%;
  overflow: visible;
  bottom: 2vmin;
  text-align: center;
}
#dpad {
  position: fixed;
  left: 2vmin;
  bottom: 2vmin;
  width: 21vmin;
  height: 21vmin;
  border: 1px solid black;
  border-radius: 7vmin;
}
.dpad div {
  width: 7vmin;
  height: 7vmin;
  line-height: 7vmin;
  text-align: center;
  border: 1px solid black;
  margin: -1px;
  background-color: white;
  color: black;
}
.dpad div.active {
  background-color: black;
  color: white;
}
.dpad .up {
  position: absolute;
  top: 0;
  left: 7vmin;
}
.dpad .left {
  position: absolute;
  left: 0;
  top: 7vmin;
}
.dpad .right {
  position: absolute;
  right: 0;
  top: 7vmin;
}
.dpad .down {
  position: absolute;
  bottom: 0;
  left: 7vmin;
}
#buttons {
  position: fixed;
  right: 2vmin;
  bottom: 2vmin;
  height: 7vmin;
}
.buttons .button, .pause .button {
  display: inline-block;
  width: 7vmin;
  height: 7vmin;
  line-height: 7vmin;
  text-align: center;
  border: 1px solid black;
  border-radius: 2vmin;
  margin: -1px;
  background-color: white;
  color: black;
}
.pause .button {
  width: auto;
  padding: 0 2vmin;
}
.buttons .button.active, .pause .button.active {
  background-color: black;
  color: white;
}
</style>
<?php
function loadScript($script) {
  echo "<script src='$script.js?cb=" . filemtime("$script.js") . "'></script>\n";
}
$scripts = array('Engine', 'Point', 'Rect', 'Sprite', 'Scene', 'Camera', 'AssetStore', 'TouchControls', 'TileMap');
foreach ($scripts as $script) {
  loadScript($script);
}
?>
</head>
<body>
<input type='checkbox' id='pause' checked />
<button id='step' onclick='engine.step();pauseCheck.checked=true'>Step</button>
<div id='fps'></div>
<div id='camera'></div>
<div id='loading'>Loading...</div>
<div id='dpad'></div>
<div id='pauseContainer'></div>
<div id='buttons'></div>
<script>
const fpsMeter = document.getElementById('fps');

const touchControls = new TouchControls(document.getElementById('dpad'), document.getElementById('buttons'), document.getElementById('pauseContainer'), [{ label: 'A', key: ' ' }]);
touchControls.onPauseClicked = () => pauseCheck.click();

const pauseCheck = document.getElementById('pause');
pauseCheck.onclick = () => window.engine.pause(!pauseCheck.checked);
</script>
<?php
loadScript('ld43');
?>
</body>
</html>
