<!DOCTYPE html>
<html>
<head>
<style>
#step, #pause {
  margin-top: 3em;
  float: right
}
#camera, #loading, #splash, #helppage {
  width: 640px;
  height: 480px;
  border: 1px solid black;
  position: absolute;
  top: 0;
  left: calc(50% - 320px);
}
#splash, #helppage {
  background: rgba(255, 255, 255, .5);
  display: none;
  text-align: center;
}
#helppage {
  font-family: sans-serif;
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
.bigbutton {
  display: inline-block;
  width: 200px;
  margin: 20px;
  padding: 20px;
  font-size: 30px;
  height: 50px;
  line-height: 50px;
  border: 2px solid black;
  border-radius: 5px;
  font-family: sans-serif;
  color: black;
  text-decoration: none;
}
.bigbutton.start {
  background: linear-gradient(rgb(128, 255, 128), rgb(0, 128, 0));
}
.bigbutton.help {
  background: linear-gradient(rgb(255, 255, 128), rgb(128, 128, 0));
}
.bigbutton.start:active {
  background: linear-gradient(rgb(32, 128, 32), rgb(100, 192, 100));
}
.bigbutton.help:active {
  background: linear-gradient(rgb(128, 128, 32), rgb(220, 220, 0));
}
#helppage td, #helppage tr {
  text-align: center;
  padding: 6px;
}
#pauseBox, #gameOver {
  background: rgba(255, 255, 128, .9);
  font-family: sans-serif;
  text-align: center;
  display: none;
  position: absolute;
  width: 320px;
  height: 200px;
  line-height: 200px;
  border: 1px solid black;
  top: 140px;
  left: calc(50% - 160px);
}
#pauseBox div, #gameOver div {
  display: inline-block;
  line-height: initial;
  vertical-align: middle;
}
#pauseBox h1 {
  animation: blink 2s infinite;
}
h1 {
  font-size: 30px;
  padding: 0;
  margin: 0 0 20px;
  font-weight: bold;
}
#statusBar {
  width: 640px;
  height: 20px;
  position: absolute;
  top: 0;
  left: calc(50% - 319.5px);
}
#statusBar div {
  min-width: 130px;
  margin: 2px;
  border: 1px solid white;
  border-radius: 3px;
  font-family: sans-serif;
  font-size: 14px;
  padding: 4px;
  color: white;
  background: #0000a0;
  font-weight: bold;
}
#statusBar.onTitle div {
  display: none;
}
#statusBar.onTitle div.onTitle {
  display: block;
}
#statusBar span {
  font-weight: normal;
}
#statusBar div.left {
  float: left;
  text-align: left;
}
#statusBar div.right {
  float: right;
  text-align: right;
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
<div id='fps'></div>
<div id='camera'></div>
<div id='loading'>Loading...</div>
<div id='splash'>
  <div style='font-weight: bold; font-size: 80px; margin: 30px; font-style: italic'>Golden Lord</div>
  <div style='display: inline-block; width: 80%; border: 1px solid black; background: rgba(255, 255, 0, .7); padding: 10px; text-align: left'>
    <center><b>Praise the Golden Lord!</b></center><br/>
    Your people have lived on an island rich in gold and silver for generations, and they love you
    greatly. But now, monsters are invading the island! You have stepped down from heaven to protect
    your worshipers from the invaders, but your divine power depends on the sacrifices of precious
    metal that your people offer up to your altar.
  </div>
  <a onclick='window.GameManager.newLevel()' class='bigbutton start'>Start Game</a>
  <a onclick='window.GameManager.showHelp()' class='bigbutton help'>Help</a>
</div>
<div id='helppage'>
  <div style='font-weight: bold; font-size: 40px; margin: 20px; font-family: sans-serif'>How to Play</div>
  <div style='display: inline-block; width: 90%; border: 1px solid black; background: rgba(255, 255, 0, .7); padding: 10px; text-align: left'>
    <table width='100%'>
      <tr><th align='center' width='20%'>Action</th><th align='center' width='30%'>Keyboard</th><th align='center' width='50%'>Touchscreen</th></tr>
      <tr><td>Move</td><td>Arrow Keys</td><td>Virtual D-Pad (left side)</td></tr>
      <tr><td>Attack</td><td>Space Bar</td><td>A Button (right side)</td></tr>
      <tr><td>Pause</td><td>Escape</td><td>Pause Button (center)</td></tr>
    </table>
    <br/>
    Your worshipers will automatically travel between the mines and your altar to collect treasure and sacrifice it to you.<br/><br/>
    Sacrifices restore your divine power, automatically allowing you to recover from damage and healing the one to make the offering.
  </div>
  <a onclick='window.GameManager.showTitle()' class='bigbutton help'>Back</a>
</div>
<div id='pauseBox'>
  <div>
    <h1>PAUSED</h1>
    Press Escape or Pause to continue
  </div>
</div>
<div id='gameOver'>
  <div>
    <h1>GAME OVER</h1>
    <a onclick='window.GameManager.showTitle()' class='bigbutton start'>Start Over</a>
  </div>
</div>
<div id='statusBar' class='onTitle'>
  <div class='left onTitle'>
    High Score: <span id='highScore'>0</span>
  </div>
  <div class='left'>
    Score: <span id='score'>0</span>
  </div>
  <div class='right'>
    Worshipers: <span id='worshipCount'>0</span>
  </div>
</div>
<div id='dpad'></div>
<div id='pauseContainer'></div>
<div id='buttons'></div>
<audio id='attackSound'><source src='assets/attack.wav' type='audio/wav' /></audio>
<audio id='damageSound'><source src='assets/damage.wav' type='audio/wav' /></audio>
<audio id='npcdamageSound'><source src='assets/npcdamage.wav' type='audio/wav' /></audio>
<audio id='pickupSound'><source src='assets/pickup.wav' type='audio/wav' /></audio>
<audio id='playerdeathSound'><source src='assets/playerdeath.wav' type='audio/wav' /></audio>
<audio id='enemydeathSound'><source src='assets/enemydeath.wav' type='audio/wav' /></audio>
<audio id='npcdeathSound'><source src='assets/npcdeath.wav' type='audio/wav' /></audio>
<script>
const fpsMeter = document.getElementById('fps');

const touchControls = new TouchControls(document.getElementById('dpad'), document.getElementById('buttons'), document.getElementById('pauseContainer'), [{ label: 'A', key: ' ' }]);
touchControls.onPauseClicked = () => pauseCheck.click();
</script>
<?php
loadScript('ld43');
?>
</body>
</html>
