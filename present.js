let boxBack, boxClose, boxOpen;
let openImg, simauImg;
let charaImgs = [];
let charaReactions = [];
let currentCharaIndex = 0;
let showReaction = false;

let boxFrontAnim, boxFrontReAnim;
let state = "closed";

const baseWidth = 1554;
const baseHeight = 1431;

let scaleFactor = 1;

let animStartTime = 0;
let reactionStartTime = 0;
let isReacting = false;
let reactionDuration = 500;

let reactionSound;

function preload() {
  boxBack = loadImage("asset/boxBack.png");
  boxClose = loadImage("asset/box_close.png");
  boxOpen = loadImage("asset/box_open.png");
  openImg = loadImage("asset/open.png");
  simauImg = loadImage("asset/simau.png");

  for (let i = 1; i <= 17; i++) {
    charaImgs.push(loadImage(`asset/chara${i}.png`));
    charaReactions.push(loadImage(`asset/chara${i}_react.png`));
  }

  reactionSound = loadSound("asset/se.mp3");
}

function setup() {  
  pixelDensity(1);
  let c = createCanvas(baseWidth, baseHeight);
  c.parent("wrapper");
  imageMode(CENTER);

  boxFrontAnim = createImg("asset/boxFront.webp");
  boxFrontAnim.parent("wrapper");
  boxFrontAnim.hide();

  boxFrontReAnim = createImg("asset/boxFrontRe.webp");
  boxFrontReAnim.parent("wrapper");
  boxFrontReAnim.hide();

  noLoop();
  currentCharaIndex = floor(random(charaImgs.length));

  appStartTime = millis();
  centerCanvasAndDOM();
}

function windowResized() {
  centerCanvasAndDOM();
}

function centerCanvasAndDOM() {
  const w = windowWidth;
  const h = windowHeight;

  scaleFactor = min(w / baseWidth, h / baseHeight);

  const scaledWidth = baseWidth * scaleFactor;
  const scaledHeight = baseHeight * scaleFactor;

  const offsetX = (w - scaledWidth) / 2;
  const offsetY = (h - scaledHeight) / 2;

  const c = canvas;
  c.style.position = "absolute";
  c.style.left = `${offsetX}px`;
  c.style.top = `${offsetY}px`;
  c.style.width = `${scaledWidth}px`;
  c.style.height = `${scaledHeight}px`;

  for (let anim of [boxFrontAnim, boxFrontReAnim]) {
    anim.size(scaledWidth, scaledHeight);
    anim.elt.style.width = scaledWidth + "px";
    anim.elt.style.height = scaledHeight + "px";
  }
}

function draw() {
  background(255);
  push();
  image(boxBack, baseWidth / 2, baseHeight / 2, baseWidth, baseHeight);

  if (state === "open" || state === "closing" || state === "opening") {
    let now = millis();
    let animDuration = 2000;
    let alphaValue = 255;

    if (state === "closing") {
      let elapsed = now - animStartTime;
      let t = constrain((elapsed - 900) / 400, 0, 1);
      alphaValue = 255 * (1 - t);
    }

    if (state === "opening") {
      let elapsed = now - animStartTime;
      let t = constrain((elapsed - 1600) / 300, 0, 1);
      alphaValue = 255 * t;
    }

    tint(255, alphaValue);
    if (isReacting) {
      push();
  let yOffset = sin(frameCount * 0.025) * 2;
      translate(baseWidth / 2, baseHeight / 2);
      scale(1, 0.98);
      image(charaReactions[currentCharaIndex], 0, 0+yOffset);
      pop();
    } else {
            push();
  let yOffset = sin(frameCount * 0.025);
      image(charaImgs[currentCharaIndex], baseWidth / 2, baseHeight / 2+yOffset);
      scale(1, 1+yOffset*5);
            pop();
    }

    image(boxOpen, baseWidth / 2, baseHeight / 2);
    noTint();
    drawSimauButton();
  }

  if (state === "closed") {
    image(boxClose, baseWidth / 2, baseHeight / 2);
    loop();
    drawOpenButton();
  }
  pop();
}

function drawOpenButton() {
  let yOffset = sin(frameCount * 0.05) * 10;
  image(openImg, baseWidth / 2, baseHeight / 2 + yOffset);
}

function drawSimauButton() {
  const simauX = baseWidth / 2 - baseWidth / 3;
  const simauY = baseHeight / 2 - baseHeight / 3;
  image(simauImg, simauX, simauY);
}

let canClick = true;

function mousePressed() {
  if (!canClick) return;
  if (millis() - appStartTime < 500) return;

  const mx = mouseX;
  const my = mouseY;

  if (state === "closed") {
    canClick = false;
    setTimeout(() => {
      startOpening();
      canClick = true;
    }, 300); 
  } else if (state === "open") {
    const simauX = baseWidth / 2 - baseWidth / 3;
    const simauY = baseHeight / 2 - baseHeight / 3;
    const simauW = simauImg.width;
    const simauH = simauImg.height;

    if (
      mx > simauX - simauW / 2 &&
      mx < simauX + simauW / 2 &&
      my > simauY - simauH / 2 &&
      my < simauY + simauH / 2
    ) {
      canClick = false;
      setTimeout(() => {
        startClosing();
        canClick = true;
      }, 300);
    } else {
      if (!isReacting) {
        isReacting = true;
        reactionStartTime = millis();
        if (reactionSound && reactionSound.isLoaded()) {
          reactionSound.setVolume(0.3);
          reactionSound.play();
        }
        redraw();
        setTimeout(() => {
          isReacting = false;
          redraw();
        }, reactionDuration);
      }
    }
  }
}


let boxFrontAnimToggle = false;
let boxFrontReAnimToggle = false;

function startOpening() {
  state = "opening";
  animStartTime = millis();

  boxFrontAnimToggle = !boxFrontAnimToggle;
  const src = boxFrontAnimToggle
    ? "asset/boxFront.webp"
    : "asset/boxFront-1.webp";
  boxFrontAnim.elt.src = src;

  const w = windowWidth;
  const h = windowHeight;
  scaleFactor = min(w / baseWidth, h / baseHeight);

  const scaledWidth = baseWidth * scaleFactor;
  const scaledHeight = baseHeight * scaleFactor;
  const offsetX = (windowWidth - scaledWidth) / 2;
  const offsetY = (windowHeight - scaledHeight) / 2;

  boxFrontAnim.size(scaledWidth, scaledHeight);
  boxFrontAnim.position(offsetX, offsetY);

  boxFrontAnim.show();

  currentCharaIndex = floor(random(charaImgs.length));
  showReaction = false;

  setTimeout(() => {
    boxFrontAnim.hide();
    state = "open";
    redraw();
  }, 2000);
}

function startClosing() {
  state = "closing";
  animStartTime = millis();

  boxFrontReAnimToggle = !boxFrontReAnimToggle;
  const src = boxFrontReAnimToggle
    ? "asset/boxFrontRe.webp"
    : "asset/boxFrontRe-1.webp";
  boxFrontReAnim.elt.src = src;

  const w = windowWidth;
  const h = windowHeight;
  scaleFactor = min(w / baseWidth, h / baseHeight);

  const scaledWidth = baseWidth * scaleFactor;
  const scaledHeight = baseHeight * scaleFactor;
  const offsetX = (windowWidth - scaledWidth) / 2;
  const offsetY = (windowHeight - scaledHeight) / 2;

  boxFrontReAnim.size(scaledWidth, scaledHeight);
  boxFrontReAnim.position(offsetX, offsetY);

  boxFrontReAnim.show();
  setTimeout(() => {
    boxFrontReAnim.hide();
    state = "closed";
    redraw();
  }, 1500);
}
