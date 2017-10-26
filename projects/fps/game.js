var canvas = document.getElementById("display"),
  fps = 30,
  interval = 1000 / fps,
  lastTime = new Date().getTime(),
  currentTime = 0,
  delta = 0;

var CIRCLE = Math.PI * 2;

//the current level
var level, player, camera, controls, light;

var started = false,
  mouseLocked = false;
//initialize
function Init() {
  controls = new Controls();
  player = new Player(17.5, 10.5, Math.PI * 0);
  camera = new Camera(100, 0.6);
  LoadLevelData("map");
}

canvas.requestPointerLock =
  canvas.requestPointerLock || canvas.mozRequestPointerLock;

document.exitPointerLock =
  document.exitPointerLock || document.mozExitPointerLock;

canvas.onclick = function() {
  canvas.requestPointerLock();
};

// Hook pointer lock state change events for different browsers
document.addEventListener("pointerlockchange", lockChange, false);
document.addEventListener("mozpointerlockchange", lockChange, false);

//toggle mouse lock
function lockChange() {
  if (
    document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas
  ) {
    mouseLocked = true;
  } else {
    mouseLocked = false;
  }
}

//mouse rotation
var onmousemove = function(e) {
  if (mouseLocked) player.rotate(Math.PI * (e.movementX / 1000));
};

//starts on load, change later
function Start() {
  if (!started) {
    GameLoop();
    started = true;
  }
}
var timestep = 1000 /30;
var framesThisSecond = 0,
    lastFpsUpdate = 0;
 
//main loop
function GameLoop(timestamp) {
  
      if (timestamp > lastFpsUpdate + 1000) { // update every second
        fps = 0.25 * framesThisSecond + (1 - 0.25) * fps; // compute the new FPS
 
        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;
  
  if(timestamp < lastTime + (1000/fps)){
    requestAnimationFrame(GameLoop);
    return;
  }
  delta += timestamp - lastTime;
  lastTime = timestamp;
  
  var numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }
    player.update(controls.states, level, delta);
    camera.render(player, level);
    requestAnimationFrame(GameLoop);
 // requestAnimationFrame(GameLoop);

//  player.update(controls.states, level, delta);
//  camera.render(player, level);

//  currentTime = new Date().getTime();
//  delta = currentTime - lastTime;

  //if (delta > interval) {
  //  lastTime = currentTime - delta % interval;
 // }
}

function panic() {
    delta = 0;
}


function Camera(resolution, focalLength) {
  this.ctx = canvas.getContext("2d");
  this.width = canvas.width =320;// window.innerWidth * 0.5;
  this.height = canvas.height = 200;//window.innerHeight * 0.5;
  this.resolution = resolution;
  this.spacing = this.width / resolution;
  this.focalLength = focalLength || 0.8;
  this.range = 40;
  this.lightRange = 3;
  this.scale = (this.width + this.height) / 1200;
}

//main render
Camera.prototype.render = function(player, map) {
  this.ctx.save();

  this.ctx.fillStyle = "#5F6467";
  this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);

  this.ctx.fillStyle = "#a8a8a8";
  this.ctx.fillRect(0, 0, this.width, this.height * 0.5);

  this.ctx.restore();

  this.drawColumns(player);
};

//draw the columns
Camera.prototype.drawColumns = function(player) {
  this.ctx.save();
  for (var column = 0; column < this.resolution; column++) {
    var x = column / this.resolution - 0.5;
    var angle = Math.atan2(x, this.focalLength);
    var ray = level.cast(player, player.direction + angle, this.range);
    this.drawColumn(column, ray, angle, 0);
  }
  this.ctx.restore();
};

Camera.prototype.drawColumn = function(column, ray, angle, li) {
  var ctx = this.ctx;
  var left = Math.floor(column * this.spacing);
  var width = Math.ceil(this.spacing);
  var hit = -1;
  while (++hit < ray.length && ray[hit].height <= 0);
  for (var s = ray.length - 1; s >= 0; s--) {
    var step = ray[s];
    if (s === hit) {
      texture = level.textures[step.wallID];
      var textureX = Math.floor(texture.width * step.offset);
      var wall = this.project(step.height, angle, step.distance);

      ctx.globalAlpha = 1;

      var levLight = level.lightFade(
        level.getLight(step.x, step.y),
        step.x,
        step.y
      );
      //temp disable dynamic light, applies full illumination
      levLight = 0;
      
      if (levLight < 1)
        ctx.drawImage(
          texture.image,
          textureX,
          0,
          1,
          texture.height,
          left,
          wall.top,
          width,
          wall.height
        );

      var playerLight = Math.max(
        (step.distance + step.shading) / this.lightRange - level.light,
        0
      );
      ctx.globalAlpha = Math.min(1, levLight);
      ctx.fillStyle = "#000000";
      ctx.fillRect(left, wall.top, width, wall.height);
    }
  }
};

var doOnce = 0;

Camera.prototype.project = function(height, angle, distance) {
  var z = distance * Math.cos(angle);
  var wallHeight = this.height * height / z;
  var bottom = this.height / 2 * (1 + 1 / z);
  return {
    top: bottom - wallHeight,
    height: wallHeight
  };
};

//set the controls
function Controls() {
  this.codes = {
    37: "left",
    65: "left",
    39: "right",
    68: "right",
    38: "forward",
    87: "forward",
    40: "backward",
    83: "backward",
    49: "one",
    50: "two",
    81: "rotateLeft",
    69: "rotateRight",
    76: "moveLight"
  };
  this.states = {
    left: false,
    right: false,
    forward: false,
    backward: false,
    one: false,
    two: false,
    rotateLeft: false,
    rotateRight: false,
    moveLight: false
  };
  document.addEventListener("keydown", this.onKey.bind(this, true), false);
  document.addEventListener("keyup", this.onKey.bind(this, false), false);
  // register the callback when a pointerlock event occurs
  // document.addEventListener("pointerlockchange", changeCallback, false);
  // document.addEventListener("mozpointerlockchange", changeCallback, false);
  // document.addEventListener("webkitpointerlockchange", changeCallback, false);
}

Controls.prototype.onKey = function(val, e) {
  var state = this.codes[e.keyCode];
  if (typeof state === "undefined") return;
  this.states[state] = val;
  //  e.preventDefault && e.preventDefault();
  //  e.stopPropagation && e.stopPropagation();
};

function Player(x, y, direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.weapon = new Texture(
    "https://raw.githubusercontent.com/hunterloftis/playfuljs-demos/gh-pages/raycaster/assets/knife_hand.png",
    319,
    320
  );
  this.paces = 0;
}

Player.prototype.rotate = function(angle) {
  this.direction = (this.direction + angle + CIRCLE) % CIRCLE;
};
//look at combining these later
Player.prototype.walk = function(distance) {
  var dx = Math.cos(this.direction) * distance;
  var dy = Math.sin(this.direction) * distance;
  if (level.get(this.x + dx, this.y) <= 0) this.x += dx;
  if (level.get(this.x, this.y + dy) <= 0) this.y += dy;
  this.paces += distance;
};

Player.prototype.walkSide = function(distance) {
  var dx = Math.cos(this.direction + 90 * (Math.PI / 180)) * distance;
  var dy = Math.sin(this.direction + 90 * (Math.PI / 180)) * distance;
  if (level.get(this.x + dx, this.y) <= 0) this.x += dx;
  if (level.get(this.x, this.y + dy) <= 0) this.y += dy;
  this.paces += distance;
};

Player.prototype.update = function(controls, map, seconds) {
  if (controls.rotateLeft) this.rotate(-Math.PI * 0.03); // * seconds
  if (controls.rotateRight) this.rotate(Math.PI * 0.03);
  if (controls.left) this.walkSide(-0.15);
  if (controls.right) this.walkSide(0.15);
  if (controls.forward) this.walk(0.15);
  if (controls.backward) this.walk(-0.15);
  if (controls.one) LoadLevelData("map");
  if (controls.two) LoadLevelData("map2");
  if (controls.moveLight) {
    level.lights[1].x = this.x;
    level.lights[1].y = this.y;
  }
};

//load level
function LoadLevelData(mapName) {
  $.getJSON(mapName + ".json", function(data) {
    level = new Level(data);
    Start();
  });
}

//creates map, TODO: create a new map?
function Level(data) {
  this.map = data.map;
  this.height = data.map.length;
  this.width = data.map[0].length;
  this.textures = [];
  this.lights = data.lights;
  this.lightData = [[], []];
  for (var i = 0; i < data.textures.length; i++) {
    this.textures.push(
      new Texture(
        data.textures[i].src,
        data.textures[i].width,
        data.textures[i].height
      )
    );
  }
  this.createLightMap();
  this.light = 1;
}

//create light data
Level.prototype.createLightMap = function() {
  this.lightData = [];
  for (var y = 0; y < this.map.length; y++) {
    var row = [];
    for (var x = 0; x < this.map[0].length; x++) {
      row.push(this.calculateLightData(x, y));
    }
    this.lightData.push(row);
  }
};

//determines the light fade based on distance to source
Level.prototype.lightFade = function(baseLight, x, y) {
  var lightLev = 1;
  if (baseLight.light === 1) return lightLev;
  for (var n = 0; n < this.lights.length; n++) {
    var a = this.lights[n].x - x;
    var b = this.lights[n].y - y;
    var c = a * a + b * b;
    lightLev *= c / (this.lights[n].range * this.lights[n].range); //*= causes issues
    // console.log(lightLev);
  }
  return lightLev;
};

//calculates a lightmap on map creations, 0 fully lit, 1 no light
//i need a way to check for rotation, the backs of walls 1 block thic are being lit
//consider checking around tiles, will increase total checks by 4x
Level.prototype.calculateLightData = function(x, y) {
  var levLight = 1;
  for (var n = 0; n < this.lights.length; n++) {
    var x1 = this.lights[n].x;
    var y1 = this.lights[n].y;
    var x2 = x;
    var y2 = y;

    var a = x1 - x2;
    var b = y1 - y2;

    var c = Math.sqrt(a * a + b * b);

    if (this.lights[n].range < c) continue;

    var angleRadians = Math.atan2(y2 - y1, x2 - x1);

    var ray2 = this.cast(this.lights[n], angleRadians, c);

    var drawLight = true;
    for (var i = 0; i < ray2.length; i++) {
      if (ray2[i].height !== 0 && x !== ray2[i].x && y !== ray2[i].y) {
        drawLight = false;
        break;
      }
    }
    if (c < this.lights[n].range && drawLight) levLight = 0;
  }
 // return levLight;
  return {
     light : levLight,
     distance : c
    };
};

//get map id at coords
Level.prototype.get = function(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (y < 0 || y > this.map.length - 1 || x < 0 || x > this.map[0].length - 1)
    return -1;
  return this.map[y][x];
};

//get light id at coords
Level.prototype.getLight = function(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (
    y < 0 ||
    y > this.lightData.length - 1 ||
    x < 0 ||
    x > this.lightData[0].length - 1
  )
    return 1;
  return this.lightData[y][x];
};
//cast rays
Level.prototype.cast = function(point, angle, range) {
  var self = this;
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  var noWall = { length2: Infinity };
  return ray({
    x: point.x,
    y: point.y,
    height: 0,
    distance: 0,
    wallID: 0
  });
  function ray(origin) {
    var stepX = step(sin, cos, origin.x, origin.y);
    var stepY = step(cos, sin, origin.y, origin.x, true);
    var nextStep =
      stepX.length2 < stepY.length2
        ? inspect(stepX, 1, 0, origin.distance, stepX.y)
        : inspect(stepY, 0, 1, origin.distance, stepY.x);
    if (nextStep.distance > range) return [origin];
    return [origin].concat(ray(nextStep));
  }
  function step(rise, run, x, y, inverted) {
    if (run === 0) return noWall;
    var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
    var dy = dx * (rise / run);
    return {
      x: inverted ? y + dy : x + dx,
      y: inverted ? x + dx : y + dy,
      length2: dx * dx + dy * dy
    };
  }
  function inspect(step, shiftX, shiftY, distance, offset) {
    var dx = cos < 0 ? shiftX : 0;
    var dy = sin < 0 ? shiftY : 0;
    step.wallID = self.get(step.x - dx, step.y - dy) - 1;
    step.height = step.wallID > -1 ? 1 : 0;
    step.distance = distance + Math.sqrt(step.length2);
    if (shiftX) step.shading = cos < 0 ? 2 : 0;
    else step.shading = sin < 0 ? 2 : 1;
    step.offset = offset - Math.floor(offset);
    return step;
  }
};

function Texture(src, width, height) {
  this.image = new Image();
  this.image.src = src;
  this.width = width;
  this.height = height;
}

Init();
