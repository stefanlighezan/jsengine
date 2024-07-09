let text = document.getElementById("test");

class Engine {
  scenes = [];
  currentSceneIndex = 0;
  start;
  update;
  requestId;

  constructor(_start = function () {}, _update = function () {}) {
    this.start = _start;
    this.update = _update;
  }

  firstRender() {
    this.start();
    const root = document.getElementById("root");
    if (root) {
      this.renderScene(this.currentSceneIndex);
    } else {
      console.error("Root container not found!");
    }
    this.requestId = requestAnimationFrame(this.loop);
  }

  loop = () => {
    this.update();
    this.requestId = requestAnimationFrame(this.loop);
    const currentScene = this.scenes[this.currentSceneIndex];
    currentScene.objects.forEach((obj) => {
      obj.updateModel();
      obj.applyGravity(); // Apply gravity to each object
    });
  };

  stopApp() {
    cancelAnimationFrame(this.requestId);
  }

  addScene(scene) {
    this.scenes.push(scene);
  }

  switchScene(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index;
      this.renderScene(index);
    } else {
      console.error("Scene index out of range!");
    }
  }

  renderScene(index) {
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = ""; // Clear the root container
      const currentScene = this.scenes[index];
      currentScene.objects.forEach((obj) => root.appendChild(obj.object));
    } else {
      console.error("Root container not found!");
    }
  }
}

class Scene {
  objects = [];

  constructor(_objects = []) {
    this.objects = _objects;
  }

  addObject(obj) {
    this.objects.push(obj);
  }
}

class Object {
  engine;
  transform = new Vector3();
  velocity = new Vector3();
  acceleration = new Vector3(0, 0.1, 0);
  color;
  gravityScale = 0.1;
  width;
  height;
  object;
  collider; // Add collider variable

  constructor(engine, _transform, w, h, _color = new Color(0, 0, 0)) {
    this.transform = _transform;
    let obj = document.createElement("div");
    this.width = w;
    this.height = h;
    obj.id = "defaultSquare";
    this.object = obj;
    this.color = _color;
    this.engine = engine;
    this.collider = new Collider(this); // Initialize collider

    engine.objects;
  }

  updateModel = function () {
    // Update position based on velocity
    this.transform.y += this.velocity.y;
    this.transform.x += this.velocity.x;

    this.object.style.top = this.transform.y + "px";
    this.object.style.left = this.transform.x + "px";
    this.object.style.width = `${this.width}px`;
    this.object.style.height = `${this.height}px`;

    this.object.style.backgroundColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
  };

  applyGravity = function () {
    if(!this.collider.frozen) {
      // Apply acceleration to velocity
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y * this.gravityScale;
    }
  };

  addFunction = function (type, ev) {
    console.log(type);
    this.object.addEventListener(type, () => {
      ev();
    });
  };

  // Add a method to check collision with another object
  checkCollision = function (otherObject) {
    return (
      this.transform.x < otherObject.transform.x + otherObject.width &&
      this.transform.x + this.width > otherObject.transform.x &&
      this.transform.y < otherObject.transform.y + otherObject.height &&
      this.transform.y + this.height > otherObject.transform.y
    );
  };

  // Add a method to handle collision response
  handleCollision = function (otherObject) {
    if (otherObject.collider.frozen) {
      // If the other object is frozen, bounce back
      this.velocity.y = -this.velocity.y;
      this.velocity.x = -this.velocity.x;

      this.velocity.x *= 0.8
      this.velocity.y *= 0.8

      if(Math.abs(this.velocity.y) <= 0.001){}
    }
  };
}

class Text {
  engine;
  transform = new Vector3();
  textContent;
  object;
  collider; // Add collider variable

  constructor(engine, _transform, _textContent, _color = new Color(0, 0, 0)) {
    this.transform = _transform;
    this.textContent = _textContent;
    let obj = document.createElement("div");
    obj.textContent = _textContent;
    obj.style.position = "absolute";
    this.object = obj;
    this.engine = engine;
    this.collider = new Collider(this); // Initialize collider
  }

  updateModel = function () {
    // Update position
    this.object.style.top = this.transform.y + "px";
    this.object.style.left = this.transform.x + "px";
    this.object.style.color = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
  };

  addFunction = function (type, ev) {
    this.object.addEventListener(type, () => {
      ev();
    });
  };

  setText = function (text) {
    this.textContent = text;
    this.object.textContent = text;
  };
}

class Collider {
  frozen = false;

  constructor(parentObject) {
    // Initialize collider properties
    this.parentObject = parentObject;
  }

  freeze = function () {
    this.frozen = true;
  };

  unfreeze = function () {
    this.frozen = false;
  };
}

class Vector3 {
  x = 0;
  y = 0;
  z = 0;

  constructor(_x = 0, _y = 0, _z = 0) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }
}

class Color {
  r
  g
  b

  constructor(_r = 0, _g = 0, _b = 0) {
    this.r = _r
    this.g = _g
    this.b = _b
  }
}

let engine = new Engine(Start, Update);

let scene1 = new Scene();
let obj1 = new Object(engine, new Vector3(0, 0, 0), 50, 50, new Color(0, 255, 255));
scene1.addObject(obj1);

let scene2 = new Scene();
let obj2 = new Object(engine, new Vector3(0, 250, 0), 50, 50, new Color(255, 0, 255));
scene2.addObject(obj2);

let textObj = new Text(engine, new Vector3(150, 150, 0), "Game (Click Text To Begin)", new Color(255, 255, 255));
scene1.addObject(textObj);

engine.addScene(scene1);
engine.addScene(scene2);

textObj.addFunction("click", () => {
  engine.switchScene(1)
})

engine.firstRender();

function Start() {
  alert("Hello!");

  obj1.addFunction("click", () => {
    // Jump when clicked
    engine.switchScene(1)
  });

  obj2.addFunction("click", () => {
    // Jump when clicked
    engine.switchScene(0)
  });
}

function Update() {

}