import {
  FLOWER_SPACING,
  MAX_FLOWERS
} from "./constants";

import {
  createTrailFlower,
  scatterFlower,
  releaseFlower
} from "./FlowerFactory";

export default class FlowerEngine {
  constructor() {
    this.flowers = [];
    this.lastFinger = new Map();
  }

  getFlowers() {
    return this.flowers;
  }

  updateFinger(id, x, y) {
    const last = this.lastFinger.get(id);
    const now = performance.now();

    if (!last) {
      this.spawnTrail(x, y);
      this.lastFinger.set(id, { x, y, accumulatedDist: 0, lastSpawnTime: now });
      return;
    }

    const dx = x - last.x;
    const dy = y - last.y;
    const distance = Math.hypot(dx, dy);

    last.accumulatedDist = (last.accumulatedDist || 0) + distance;
    last.x = x;
    last.y = y;

    if (last.accumulatedDist >= FLOWER_SPACING) {
      while (last.accumulatedDist >= FLOWER_SPACING) {
        this.spawnTrail(x, y);
        last.accumulatedDist -= FLOWER_SPACING;
      }
      last.lastSpawnTime = now;
    } else if (now - (last.lastSpawnTime || 0) > 220) {
      // Slow movement or hover: spawn a flower if held or moved slowly for > 220ms
      this.spawnTrail(x, y);
      last.lastSpawnTime = now;
      last.accumulatedDist = 0;
    }
  }


  stopFinger(id) {
    this.lastFinger.delete(id);
  }

  spawnTrail(x, y) {
    if (this.flowers.length >= MAX_FLOWERS) {
      releaseFlower(this.flowers[0]);
      this.flowers.shift();
    }

    this.flowers.push(createTrailFlower(x, y));
  }

  scatter(originX, originY) {
    this.lastFinger.clear();
    for (const flower of this.flowers) {
      if (!flower.throwing) {
        scatterFlower(flower, originX, originY);
      }
    }
  }

  clear() {
    for (const flower of this.flowers) {
      releaseFlower(flower);
    }
    this.flowers.length = 0;
    this.lastFinger.clear();
  }
}

