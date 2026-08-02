import {
  AIR_RESISTANCE,
  THROW_RESISTANCE,
  OFFSCREEN_MARGIN
} from "./constants";

import { getFlowerSprite } from "./FlowerSprites";
import { releaseFlower } from "./FlowerFactory";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];

export default class FlowerRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  drawHandSkeleton(handLandmarks) {
    if (!handLandmarks || handLandmarks.length === 0) return;

    const ctx = this.ctx;
    ctx.save();

    for (const hand of handLandmarks) {
      if (!hand || hand.length < 21) continue;

      // Draw connection lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const start = hand[startIdx];
        const end = hand[endIdx];

        ctx.beginPath();
        ctx.moveTo(start.x * this.width, start.y * this.height);
        ctx.lineTo(end.x * this.width, end.y * this.height);
        ctx.stroke();
      }

      // Draw joint dots
      for (let i = 0; i < hand.length; i++) {
        const pt = hand[i];
        const px = pt.x * this.width;
        const py = pt.y * this.height;

        if (i === 8) {
          // Highlighted Index Tip Marker (Gold accent glow)
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Standard white joint dot
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  render(flowers, deltaTime, handLandmarks = null) {
    const ctx = this.ctx;
    const dt = Math.min(deltaTime, 0.05);

    ctx.clearRect(0, 0, this.width, this.height);

    // Draw hand skeleton overlay
    if (handLandmarks) {
      this.drawHandSkeleton(handLandmarks);
    }

    // Draw flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
      const flower = flowers[i];

      //--------------------------------------------------
      // Physics
      //--------------------------------------------------
      flower.vy += flower.gravity * dt;

      const dragFactor = flower.throwing ? THROW_RESISTANCE : AIR_RESISTANCE;
      const drag = Math.pow(dragFactor, dt * 60);
      flower.vx *= drag;
      flower.vy *= drag;

      flower.x += flower.vx * dt;
      flower.y += flower.vy * dt;

      flower.rotation += flower.rotationSpeed * (dt * 60);
      flower.life -= flower.fade * dt;

      //--------------------------------------------------
      // Remove dead or offscreen flowers
      //--------------------------------------------------
      if (
        flower.life <= 0 ||
        flower.x < -OFFSCREEN_MARGIN ||
        flower.x > this.width + OFFSCREEN_MARGIN ||
        flower.y < -OFFSCREEN_MARGIN ||
        flower.y > this.height + OFFSCREEN_MARGIN
      ) {
        releaseFlower(flower);
        flowers.splice(i, 1);
        continue;
      }

      //--------------------------------------------------
      // Draw cached sprite (No shadowBlur for max performance)
      //--------------------------------------------------
      const sprite = getFlowerSprite(flower.species, {
        petal: flower.petalHue,
        center: flower.centerHue,
        petalLight: flower.petalLight
      });

      const alpha = Math.max(flower.life, 0);
      const size = flower.size * (0.5 + 0.5 * alpha);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(flower.x, flower.y);
      ctx.rotate((flower.rotation * Math.PI) / 180);

      ctx.drawImage(sprite, -size, -size, size * 2, size * 2);

      ctx.restore();
    }
  }
}
