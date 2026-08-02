import {
  SPECIES,
  PALETTES,
  MIN_SIZE,
  MAX_SIZE,
  THROW_MIN_SIZE,
  THROW_MAX_SIZE,
} from "./constants";

// -------------------------------------
// Object Pool
// -------------------------------------

const pool = [];

function getFlower() {
  return pool.pop() || {};
}

export function releaseFlower(flower) {
  pool.push(flower);
}

// -------------------------------------
// Helpers
// -------------------------------------

function randomSpecies() {
  return SPECIES[Math.floor(Math.random() * SPECIES.length)];
}

function randomPalette(species) {
  const palettes = PALETTES[species];
  return palettes[Math.floor(Math.random() * palettes.length)];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// -------------------------------------
// Shared initializer
// -------------------------------------

function initializeFlower(
  flower,
  x,
  y,
  vx,
  vy,
  throwing = false
) {
  const species = randomSpecies();
  const palette = randomPalette(species);

  flower.x = x;
  flower.y = y;

  flower.vx = throwing ? vx : 0;
  flower.vy = throwing ? vy : 0;

  flower.species = species;

  flower.petalHue = palette.petal;
  flower.centerHue = palette.center;
  flower.petalLight = !!palette.petalLight;

  flower.throwing = throwing;

  flower.rotation = rand(0, 360);

  flower.rotationSpeed = throwing
    ? rand(-10, 10)
    : 0;

  flower.size = throwing
    ? rand(THROW_MIN_SIZE, THROW_MAX_SIZE)
    : rand(MIN_SIZE, MAX_SIZE);

  flower.gravity = throwing ? 1500 : 0;

  flower.drag = throwing ? 0.95 : 1.0;

  flower.life = 1;

  flower.fade = throwing
    ? rand(0.6, 1.0)
    : 0;

  flower.glow = throwing
    ? rand(15, 30)
    : 0;

  return flower;
}

// -------------------------------------
// Trail Flower (Drawing Mode)
// -------------------------------------

export function createTrailFlower(
  x,
  y
) {
  const flower = getFlower();

  return initializeFlower(
    flower,
    x,
    y,
    0,
    0,
    false
  );
}

// -------------------------------------
// Burst Flower
// -------------------------------------

export function createBurstFlower(
  x,
  y
) {
  const angle = Math.random() * Math.PI * 2;
  const speed = rand(350, 750);

  const flower = getFlower();

  return initializeFlower(
    flower,
    x,
    y,
    Math.cos(angle) * speed,
    Math.sin(angle) * speed,
    true
  );
}

// -------------------------------------
// Scatter Existing Flower
// -------------------------------------

export function scatterFlower(flower, originX, originY) {
  const dx = flower.x - originX;
  const dy = flower.y - originY;
  let angle = Math.atan2(dy, dx);
  if (dx === 0 && dy === 0) {
    angle = Math.random() * Math.PI * 2;
  }
  const speed = rand(400, 900);

  flower.throwing = true;
  flower.vx = Math.cos(angle) * speed + rand(-100, 100);
  flower.vy = Math.sin(angle) * speed + rand(-100, 100);
  flower.gravity = rand(400, 900);
  flower.rotationSpeed = rand(-15, 15);
  flower.fade = rand(0.4, 0.8);
  return flower;
}
