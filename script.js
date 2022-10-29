// Input Handling
var currentKey = null;
var keysDown = new Array(256);

// Sprite class
function Sprite(imgType, img, size, position, isStatic, boundAction, sceneSize) {
  this.imageType = imgType;
  // 0 - image, 1 - rect, 2 - ellipse
  this.imageColor = img
  this.size = { x: size.x, y: size.y };
  this.pos = { x: position.x, y: position.y };
  this.velocity = { x: 0, y: 0 };
  this.accel = { x: 0, y: 0 };
  this.maxSpeed = 2;
  this.visibility = true;
  this.static = isStatic;
  this.ba = boundAction;
  // 0 - Wrap, 1 - Bounce, 2 - Stop, 3 - Die
  this.canvSize = { x: sceneSize.x, y: sceneSize.y };

  this.updateImage = function(newImage) {
    this.image.src = newImage;
  }

  this.draw = function() {
    //console.log("Drawing");
    if (this.imageType == 0) {
      image(this.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
    } else if (this.imageType == 1) {
      fill(this.imageColor);
      rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    } else if (this.imageType == 2) {
      fill(this.imageColor);
      ellipse(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    //console.log("Drawn");
  }

  this.update = function() {
    //console.log("Updating");
    this.velocity.x += this.accel.x;
    this.velocity.y += this.accel.y;

    this.accel.x = 0;
    this.accel.y = 0;

    if (this.velocity.x > this.maxSpeed ||
      this.velocity.y > this.maxSpeed) {
      this.setSpeed(this.maxSpeed);
    }

    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;
    //console.log("Updated");
  }

  this.toggleVis = function(newVis) {
    this.visibility = newVis;
  }

  this.setSpeed = function(newSpeed) {
    this.speed = newSpeed;

    this.velocity.x = this.speed * Math.cos(this.moveAngle);
    this.velocity.y = this.speed * Math.sin(this.moveAngle);

    this.accel.x = 0;
    this.accel.y = 0;
  }

  this.setImgAngle = function(newAngle) {
    this.imgAngle = newAngle;
  }

  this.setMoveAngle = function(newAngle) {
    this.moveAngle = newAngle;
  }

  this.addForce = function(newForce) {
    this.accel.x += newForce.x;
    this.accel.y += newForce.y;
  }

  this.updateBoundAction = function(newBoundAction) {
    this.ba = newBoundAction;
  }

  this.checkBounds = function() {
    rightEdge = false;
    leftEdge = false;
    topEdge = false;
    bottomEdge = false;

    if (this.pos.x + this.size.x >= this.canvSize.x) {
      rightEdge = true;
    }
    if (this.pos.x <= 0) {
      leftEdge = true;
    }
    if (this.pos.y + this.size.y >= this.canvSize.y) {
      bottomEdge = true;
    }
    if (this.pos.y <= 0) {
      topEdge = true;
    }

    if (this.ba == 0) {
      if (rightEdge) {
        this.pos.x = 0;
      }
      if (leftEdge) {
        this.pos.x = this.canvSize.x;
      }
      if (topEdge) {
        this.pos.y = this.canvSize.y;
      }
      if (bottomEdge) {
        this.pos.y = 0;
      }
    } else if (this.ba == 1) {
      if (rightEdge || leftEdge) {
        this.velocity.x = -1 * this.velocity.x;
        this.accel.x = 0;
        console.log("Bounce");
      }
      if (bottomEdge || topEdge) {
        this.velocity.y = -1 * this.velocity.y;
        this.accel.y = 0;
        console.log("Bounce");
      }
    } else if (this.ba == 2) {
      if (rightEdge || leftEdge) {
        this.velocity.x = 0;
        this.accel.x = 0;
      }
      if (bottomEdge || topEdge) {
        this.velocity.y = 0;
        this.accel.y = 0;
      }
    } else if (this.ba == 3) {
      //toggleVisibility(false);
    }
  }

  // Andy Harris' Simple Game Collision Checker
  this.collidesWith = function(other) {
    collision = false;
    if (this.visibility && other.visibility) {
      collision = true;

      thisLeft = this.pos.x;
      thisRight = this.pos.x + this.size.x;
      thisTop = this.pos.y;
      thisBottom = this.pos.y + this.size.y;
      otherLeft = other.pos.x;
      otherRight = other.pos.x + other.size.x;
      otherTop = other.pos.y;
      otherBottom = other.pos.y + other.size.y;
      // left side past right
      // right side past left
      // top side past bottom
      // bottom side past top
      if ((thisLeft > otherRight) ||
        (thisRight < otherLeft) ||
        (thisTop > otherBottom) ||
        (thisBottom < otherTop)) {
        collision = false;
      }
    }
    return collision;
  }
}

// Scene Variables
var fr = 30;
var bg = 51;
var sceneSize = { x: 800, y: 600 };
var sprites = new Array();
//playerSprite
sprites.push(new Sprite(1, 'red', { x: 50, y: 50 }, { x: 360, y: 360 }, false, 2, sceneSize));
//platforms
sprites.push(new Sprite(1, '#eee', { x: 25, y: 25 }, { x: 100, y: 400 }, true, 0, sceneSize));
sprites.push(new Sprite(1, '#eee', { x: 25, y: 25 }, { x: 75, y: 275 }, true, 0, sceneSize));
sprites.push(new Sprite(1, '#eee', { x: 25, y: 25 }, { x: 525, y: 250 }, true, 0, sceneSize));
sprites.push(new Sprite(1, '#eee', { x: 25, y: 25 }, { x: 300, y: 150 }, true, 0, sceneSize));

var score = 0;
var maxScore = 4;

// Scene Setup/Start
// p5 library
function setup() {
  createCanvas(sceneSize.x, sceneSize.y);
  background(bg);
  frameRate(fr);
  for (let i = 0; i < keysDown.length; i++) {
    keysDown[i] = false;
  }
}

// Scene Update
// p5 library
function draw() {
  clear();
  background(bg);
  for (let i = 0; i < sprites.length; i++) {
    //console.log(sprites[i]);
    if (sprites[i].visibility) {
      if (sprites[i].static == false) {
        for (let j = 0; j < sprites.length; j++) {
          //console.log(sprites[j]);
          if (i != j) {
            if (sprites[i].collidesWith(sprites[j])) {
              console.log("Collision!");
              sprites[j].toggleVis(false);
              score++;
            }
          }
        }
        sprites[i].checkBounds();
      }
      sprites[i].update();
      sprites[i].draw();
    }
  }

  if (score >= maxScore) {
    remove();
    alert("You Win!");
  }

  if (keysDown[K_A]) {
    sprites[0].addForce({ x: -.1, y: 0 });
  }
  if (keysDown[K_D]) {
    sprites[0].addForce({ x: .1, y: 0 });
  }
  if (keysDown[K_W]) {
    sprites[0].addForce({ x: 0, y: -.1 });
  }
  if (keysDown[K_S]) {
    sprites[0].addForce({ x: 0, y: .1 });
  }
}

// User Input
function keyPressed() {
  keysDown[keyCode] = true;
}

function keyReleased() {
  keysDown[keyCode] = false;
}

//keyboard constants
K_A = 65; K_B = 66; K_C = 67; K_D = 68; K_E = 69; K_F = 70; K_G = 71;
K_H = 72; K_I = 73; K_J = 74; K_K = 75; K_L = 76; K_M = 77; K_N = 78;
K_O = 79; K_P = 80; K_Q = 81; K_R = 82; K_S = 83; K_T = 84; K_U = 85;
K_V = 86; K_W = 87; K_X = 88; K_Y = 89; K_Z = 90;
K_LEFT = 37; K_RIGHT = 39; K_UP = 38; K_DOWN = 40; K_SPACE = 32;
K_ESC = 27; K_PGUP = 33; K_PGDOWN = 34; K_HOME = 36; K_END = 35;
K_0 = 48; K_1 = 49; K_2 = 50; K_3 = 51; K_4 = 52; K_5 = 53;
K_6 = 54; K_7 = 55; K_8 = 56; K_9 = 57;