import { SPECIES, PALETTES } from "./constants";

const CACHE = new Map();
const SIZE = 96;

export function getFlowerSprite(species, palette) {
  const key = `${species}_${palette.petal}_${palette.center}_${palette.petalLight ? 1 : 0}`;

  if (CACHE.has(key)) {
    return CACHE.get(key);
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext("2d");
  ctx.translate(SIZE / 2, SIZE / 2);

  switch (species) {
    case "sunflower":
      drawSunflower(ctx, palette);
      break;

    case "daisy":
      drawDaisy(ctx, palette);
      break;

    case "bluebell":
      drawBluebell(ctx, palette);
      break;

    case "ranunculus":
      drawRanunculus(ctx, palette);
      break;

    case "tulip":
      drawTulip(ctx, palette);
      break;

    case "phlox":
      drawPhlox(ctx, palette);
      break;

    case "sakura":
      drawSakura(ctx, palette);
      break;

    case "frangipani":
      drawFrangipani(ctx, palette);
      break;

    case "crocus":
      drawCrocus(ctx, palette);
      break;

    case "tropica":
      drawTropica(ctx, palette);
      break;

    case "clover":
      drawClover(ctx, palette);
      break;

    case "buttercup":
      drawButtercup(ctx, palette);
      break;

    case "cosmos":
      drawCosmos(ctx, palette);
      break;

    case "waterbloom":
      drawWaterbloom(ctx, palette);
      break;

    case "pressed":
      drawPressed(ctx, palette);
      break;

    case "lilypad":
      drawLilypad(ctx, palette);
      break;

    case "magnolia":
      drawMagnolia(ctx, palette);
      break;

    default:
      drawDaisy(ctx, palette);
      break;
  }

  CACHE.set(key, canvas);
  return canvas;
}

function petalGradient(ctx, hue) {
  const g = ctx.createLinearGradient(0, 0, 0, -32);
  g.addColorStop(0, `hsl(${hue}, 90%, 45%)`);
  g.addColorStop(1, `hsl(${hue}, 95%, 68%)`);
  return g;
}

function centerGradient(ctx, hue) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
  g.addColorStop(0, `hsl(${hue}, 95%, 72%)`);
  g.addColorStop(1, `hsl(${hue}, 70%, 30%)`);
  return g;
}

function drawSunflower(ctx, palette) {
  const petals = 13;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);
    ctx.fillStyle = petalGradient(ctx, palette.petal);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(-7, -18, 0, -32);
    ctx.quadraticCurveTo(7, -18, 4, 0);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = centerGradient(ctx, palette.center);
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `hsl(${palette.center}, 60%, 15%)`;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 5, Math.sin(a) * 5, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDaisy(ctx, palette) {
  const petals = 10;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);
    ctx.fillStyle = palette.petalLight
      ? "#ffffff"
      : `hsl(${palette.petal}, 70%, 92%)`;
    ctx.beginPath();
    ctx.ellipse(0, -18, 4.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = centerGradient(ctx, palette.center);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawBluebell(ctx, palette) {
  const petals = 5;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);
    ctx.fillStyle = petalGradient(ctx, palette.petal);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(9, -12, 0, -28);
    ctx.quadraticCurveTo(-9, -12, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = centerGradient(ctx, palette.center);
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawRanunculus(ctx, palette) {
  for (let ring = 0; ring < 3; ring++) {
    const radius = 18 - ring * 6;
    const petals = 8 - ring;
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / petals + ring * 0.2);
      ctx.translate(0, -radius);
      ctx.fillStyle = petalGradient(ctx, palette.petal);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.fillStyle = centerGradient(ctx, palette.center);
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTulip(ctx, palette) {
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 3);
    ctx.fillStyle = petalGradient(ctx, palette.petal);
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.bezierCurveTo(-8, -18, -3, -30, 0, -30);
    ctx.bezierCurveTo(3, -30, 8, -18, 7, 0);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = centerGradient(ctx, palette.center);
  ctx.beginPath();
  ctx.arc(0, 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
// Phlox  –  flat cartoon flower with round petals + brown circle centre
// ─────────────────────────────────────────────────────────────────────────────
function drawPhlox(ctx, palette) {
  const petals = 5;
  const dist = 16;   // distance from centre to petal centre
  const r = 14;   // petal radius

  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 * i) / petals - Math.PI / 2;
    const cx = Math.cos(a) * dist;
    const cy = Math.sin(a) * dist;

    ctx.fillStyle = `hsl(${palette.petal}, 82%, 66%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slightly darker ring to separate petals from centre
  ctx.strokeStyle = `hsl(${palette.petal}, 60%, 55%)`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Brown centre dot
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 9);
  cg.addColorStop(0, `hsl(${palette.center}, 50%, 48%)`);
  cg.addColorStop(1, `hsl(${palette.center}, 40%, 25%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sakura  –  soft, slightly-asymmetric petals + stamen lines with pink tips
// ─────────────────────────────────────────────────────────────────────────────
function drawSakura(ctx, palette) {
  // Irregular angles give the natural, lopsided look of a cherry blossom
  const petalAngles = [0, 1.28, 2.57, 3.8, 5.1];

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate(petalAngles[i]);

    const g = ctx.createLinearGradient(0, 0, 0, -30);
    g.addColorStop(0, `hsl(${palette.petal}, 55%, 80%)`);
    g.addColorStop(1, `hsl(${palette.petal}, 45%, 92%)`);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-11, -9, -13, -25, 0, -33);
    ctx.bezierCurveTo(13, -25, 11, -9, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // White stamen lines with hot-pink dots
  const stamens = 9;
  for (let i = 0; i < stamens; i++) {
    const a = (Math.PI * 2 * i) / stamens - 0.3;
    const len = 13;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();

    ctx.fillStyle = `hsl(${palette.petal}, 95%, 58%)`;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (len + 2), Math.sin(a) * (len + 2), 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Frangipani  –  5 overlapping petals with gradient, thin stamen rays + yellow dot
// ─────────────────────────────────────────────────────────────────────────────
function drawFrangipani(ctx, palette) {
  const petals = 5;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);

    const g = ctx.createLinearGradient(0, 0, 0, -36);
    g.addColorStop(0, `hsl(${palette.petal}, 75%, 60%)`);
    g.addColorStop(0.5, `hsl(${palette.petal}, 65%, 74%)`);
    g.addColorStop(1, `hsl(${palette.petal}, 55%, 82%)`);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-10, -3);
    ctx.bezierCurveTo(-19, -16, -13, -36, 0, -38);
    ctx.bezierCurveTo(13, -36, 19, -16, 10, -3);
    ctx.bezierCurveTo(4, 2, -4, 2, -10, -3);
    ctx.fill();
    ctx.restore();
  }

  // Thin radiating stamen lines
  const rays = 14;
  for (let i = 0; i < rays; i++) {
    const a = (Math.PI * 2 * i) / rays;
    ctx.strokeStyle = `hsl(${palette.petal}, 35%, 88%)`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
    ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
    ctx.stroke();
  }

  // Yellow centre
  const yg = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
  yg.addColorStop(0, '#fef08a');
  yg.addColorStop(1, '#ca8a04');
  ctx.fillStyle = yg;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
// Crocus  –  long narrow petals with vein lines, orange stamens, green leaves
// ─────────────────────────────────────────────────────────────────────────────
function drawCrocus(ctx, palette) {
  // Back layer of petals (offset by half a step)
  const petals = 6;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / petals + (pass === 0 ? Math.PI / petals : 0));

      const g = ctx.createLinearGradient(0, -6, 0, -38);
      if (pass === 0) {
        // back petals – slightly darker / more muted
        g.addColorStop(0, `hsl(${palette.petal}, 40%, 72%)`);
        g.addColorStop(1, `hsl(${palette.petal}, 45%, 82%)`);
      } else {
        // front petals
        g.addColorStop(0, `hsl(${palette.petal}, 52%, 65%)`);
        g.addColorStop(1, `hsl(${palette.petal}, 58%, 78%)`);
      }
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.bezierCurveTo(-8, -12, -7, -30, 0, -40);
      ctx.bezierCurveTo(7, -30, 8, -12, 0, -3);
      ctx.fill();

      // Vein lines on front petals only
      if (pass === 1) {
        ctx.strokeStyle = `hsl(${palette.petal}, 35%, 50%)`;
        ctx.lineWidth = 0.7;
        for (let v = -2; v <= 2; v++) {
          ctx.beginPath();
          ctx.moveTo(v * 1.6, -9);
          ctx.lineTo(v * 0.7, -36);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  // Green leaves at base
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.rotate(side * 0.38);
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(side * 4, 12, side * 7, 26, side * 3, 40);
    ctx.bezierCurveTo(0, 37, side * -1, 22, 0, 4);
    ctx.fill();
    ctx.restore();
  }

  // White stamen lines + orange anther tips
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
    ctx.stroke();

    // Orange anther
    const ag = ctx.createRadialGradient(
      Math.cos(a) * 11, Math.sin(a) * 11, 0,
      Math.cos(a) * 11, Math.sin(a) * 11, 2.8
    );
    ag.addColorStop(0, '#fbbf24');
    ag.addColorStop(1, '#ea580c');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tropica  –  watercolour plumeria: translucent layered petals, radiating lines
// ─────────────────────────────────────────────────────────────────────────────
function drawTropica(ctx, palette) {
  const petals = 5;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals - Math.PI / 10);

    // Base petal – coral/orange fill
    ctx.globalAlpha = 0.78;
    const g1 = ctx.createLinearGradient(0, 0, 0, -36);
    g1.addColorStop(0, `hsl(${palette.petal + 6}, 95%, 58%)`);
    g1.addColorStop(0.55, `hsl(${palette.petal},     88%, 70%)`);
    g1.addColorStop(1, `hsl(${palette.petal - 6}, 78%, 80%)`);
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(-13, -8, -16, -28, 0, -38);
    ctx.bezierCurveTo(13, -8, 16, -28, 0, -38); // symmetric tip
    ctx.bezierCurveTo(13, -28, 13, -8, 0, -2);
    ctx.fill();

    // Inner yellow-gold glow layer
    ctx.globalAlpha = 0.52;
    const g2 = ctx.createRadialGradient(0, -8, 0, 0, -12, 24);
    g2.addColorStop(0, 'hsl(52, 100%, 74%)');
    g2.addColorStop(0.5, `hsl(${palette.petal}, 90%, 62%)`);
    g2.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(-13, -8, -16, -28, 0, -38);
    ctx.bezierCurveTo(13, -8, 16, -28, 0, -38);
    ctx.bezierCurveTo(13, -28, 13, -8, 0, -2);
    ctx.fill();

    ctx.restore(); // also resets globalAlpha
  }

  // Deep radiating lines from heart (5 per petal direction)
  ctx.globalAlpha = 0.65;
  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 * i) / petals - Math.PI / 10 - Math.PI / 2;
    ctx.strokeStyle = `hsl(${palette.petal - 12}, 95%, 38%)`;
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Small warm centre dot
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
  cg.addColorStop(0, '#fef9c3');
  cg.addColorStop(1, `hsl(${palette.petal - 8}, 92%, 48%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
// Clover  –  four heart-shaped leaves with veins + curved stem
// ─────────────────────────────────────────────────────────────────────────────
function drawClover(ctx, palette) {
  // Each of the 4 leaves sits at NW/NE/SW/SE
  const leafAngles = [
    Math.PI * 1.25, // bottom-left
    Math.PI * 1.75, // bottom-right
    Math.PI * 0.25, // top-right
    Math.PI * 0.75, // top-left
  ];

  for (const angle of leafAngles) {
    ctx.save();
    ctx.rotate(angle);

    // Heart leaf body
    const leafG = ctx.createRadialGradient(-5, -16, 1, -3, -18, 20);
    leafG.addColorStop(0, `hsl(${palette.petal + 8}, 84%, 52%)`);
    leafG.addColorStop(1, `hsl(${palette.petal - 8}, 70%, 32%)`);
    ctx.fillStyle = leafG;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-3, -5, -20, -5, -14, -22);
    ctx.bezierCurveTo(-8, -34, 0, -30, 0, -22);
    ctx.bezierCurveTo(0, -30, 8, -34, 14, -22);
    ctx.bezierCurveTo(20, -5, 3, -5, 0, 0);
    ctx.fill();

    // Highlight teardrop
    ctx.fillStyle = `hsl(${palette.petal + 12}, 90%, 65%)`;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-3, -20, 4, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Centre vein
    ctx.strokeStyle = `hsl(${palette.petal - 10}, 55%, 28%)`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, -27);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 0.6;
    for (const vx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(vx * 5, -18, vx * 10, -15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.quadraticCurveTo(vx * 5, -26, vx * 8, -24);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Curved stem
  ctx.strokeStyle = `hsl(${palette.petal - 5}, 70%, 30%)`;
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.bezierCurveTo(5, 10, 10, 22, 8, 34);
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// Buttercup  –  sketchy elongated petals with white highlight + brown centre
// ─────────────────────────────────────────────────────────────────────────────
function drawButtercup(ctx, palette) {
  const petals = 14;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);
    // Tiny wobble for a hand-drawn feel
    ctx.rotate(((i % 3) - 1) * 0.045);

    const g = ctx.createLinearGradient(0, -10, 0, -38);
    g.addColorStop(0, `hsl(${palette.petal},     92%, 68%)`);
    g.addColorStop(1, `hsl(${palette.petal + 4}, 85%, 80%)`);
    ctx.fillStyle = g;

    // Long narrow ellipse petal
    ctx.beginPath();
    ctx.ellipse(0, -24, 5.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle white highlight streak down centre
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(0, -35);
    ctx.stroke();

    // Thin darker outer stroke for the sketchy line look
    ctx.strokeStyle = `hsl(${palette.petal - 5}, 70%, 60%)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, -24, 5.5, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Textured brown centre disk
  const cg = ctx.createRadialGradient(-1, -1, 0, 0, 0, 11);
  cg.addColorStop(0, '#d97706');
  cg.addColorStop(0.5, '#92400e');
  cg.addColorStop(1, '#78350f');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  // Tiny seed dots arranged in rings
  for (let ring = 0; ring < 2; ring++) {
    const r = ring === 0 ? 4 : 7.5;
    const count = ring === 0 ? 5 : 9;
    ctx.fillStyle = ring === 0 ? 'rgba(255,210,60,0.55)' : 'rgba(120,50,0,0.45)';
    for (let d = 0; d < count; d++) {
      const a = (Math.PI * 2 * d) / count;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cosmos  –  wide ruffled petals with white highlight + golden centre
// ─────────────────────────────────────────────────────────────────────────────
function drawCosmos(ctx, palette) {
  const petals = 6;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);

    // Wide rounded petal: lighter at centre, darker at outer edge
    const g = ctx.createRadialGradient(0, -18, 2, 0, -18, 22);
    g.addColorStop(0, `hsl(${palette.petal}, 38%, 90%)`);
    g.addColorStop(0.55, `hsl(${palette.petal}, 50%, 78%)`);
    g.addColorStop(1, `hsl(${palette.petal}, 60%, 62%)`);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo(-17, -5, -23, -20, -13, -36);
    ctx.bezierCurveTo(-6, -42, 6, -42, 13, -36);
    ctx.bezierCurveTo(23, -20, 17, -5, 0, -3);
    ctx.fill();

    // Darker outer edge stroke
    ctx.strokeStyle = `hsl(${palette.petal}, 55%, 60%)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo(-17, -5, -23, -20, -13, -36);
    ctx.bezierCurveTo(-6, -42, 6, -42, 13, -36);
    ctx.bezierCurveTo(23, -20, 17, -5, 0, -3);
    ctx.stroke();

    // White highlight streak
    ctx.strokeStyle = 'rgba(255,255,255,0.48)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.bezierCurveTo(-3, -20, -2, -30, 0, -36);
    ctx.stroke();

    ctx.restore();
  }

  // Golden centre with pollen dots
  const cg = ctx.createRadialGradient(-1, -1, 0, 0, 0, 8);
  cg.addColorStop(0, '#fef08a');
  cg.addColorStop(0.5, '#fbbf24');
  cg.addColorStop(1, '#d97706');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Small mauve pollen dots
  ctx.fillStyle = `hsl(${palette.petal}, 40%, 55%)`;
  for (let d = 0; d < 7; d++) {
    const a = (Math.PI * 2 * d) / 7;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Waterbloom  –  translucent watercolour hibiscus: 5 soft petals,
//               magenta inner zone + radiating spikes + lavender star centre
// ─────────────────────────────────────────────────────────────────────────────
function drawWaterbloom(ctx, palette) {
  const petals = 5;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals - Math.PI / 2);

    // Translucent outer petal
    ctx.globalAlpha = 0.54;
    const g = ctx.createRadialGradient(0, -20, 4, 0, -21, 20);
    g.addColorStop(0, `hsl(${palette.petal}, 62%, 75%)`);
    g.addColorStop(1, `hsl(${palette.petal}, 50%, 91%)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.bezierCurveTo(-20, -6, -24, -28, -7, -40);
    ctx.bezierCurveTo(-2, -43, 2, -43, 7, -40);
    ctx.bezierCurveTo(24, -6, 20, -28, 5, -2);
    ctx.fill();
    ctx.restore(); // resets globalAlpha
  }

  // Deep magenta inner disk
  const inner = ctx.createRadialGradient(0, 0, 0, 0, 0, 17);
  inner.addColorStop(0, `hsl(${palette.center}, 72%, 35%)`);
  inner.addColorStop(0.6, `hsl(${palette.center}, 65%, 50%)`);
  inner.addColorStop(1, 'hsla(0,0%,0%,0)');
  ctx.fillStyle = inner;
  ctx.globalAlpha = 0.80;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Radiating spike lines
  ctx.globalAlpha = 0.58;
  ctx.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    const a = (Math.PI * 2 * i) / 11;
    ctx.strokeStyle = `hsl(${palette.center}, 80%, 30%)`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
    ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 21);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tiny lavender 5-point star at centre
  const sO = 5.5, sI = 2.5;
  ctx.fillStyle = `hsl(${palette.petal + 35}, 40%, 88%)`;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? sO : sI;
    i === 0
      ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
// Pressed  –  pressed/dried 4-petal flower: wide heart petals, white sheen,
//            visible veins, tiny orange-gold centre cluster
// ─────────────────────────────────────────────────────────────────────────────
function drawPressed(ctx, palette) {
  const petals = 4;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals + Math.PI / 4);

    // Muted purple petal with a pressed / dried look
    const g = ctx.createLinearGradient(0, 0, 0, -34);
    g.addColorStop(0, `hsl(${palette.petal}, 32%, 48%)`);
    g.addColorStop(0.4, `hsl(${palette.petal}, 28%, 60%)`);
    g.addColorStop(1, `hsl(${palette.petal}, 20%, 72%)`);
    ctx.fillStyle = g;

    // Wide rounded heart-shaped petal
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-3, -4, -20, -4, -14, -22);
    ctx.bezierCurveTo(-8, -34, 0, -32, 0, -24);
    ctx.bezierCurveTo(0, -32, 8, -34, 14, -22);
    ctx.bezierCurveTo(20, -4, 3, -4, 0, 0);
    ctx.fill();

    // White sheen patch
    ctx.fillStyle = `hsl(${palette.petal}, 18%, 88%)`;
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.ellipse(5, -18, 5, 9, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Centre vein
    ctx.strokeStyle = `hsl(${palette.petal}, 38%, 38%)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.bezierCurveTo(1, -14, 2, -24, 1, -30);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 0.55;
    for (const vx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(1, -13);
      ctx.quadraticCurveTo(vx * 6, -19, vx * 11, -16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, -21);
      ctx.quadraticCurveTo(vx * 7, -27, vx * 9, -25);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Orange-gold centre
  const og = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
  og.addColorStop(0, '#fde68a');
  og.addColorStop(1, '#d97706');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#92400e';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 3, Math.sin(a) * 3, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lilypad  –  cartoon lily pad: almost-full green disk with notch cut at top,
//            radial veins from centre, highlight blobs, water-droplet bubbles
// ─────────────────────────────────────────────────────────────────────────────
function drawLilypad(ctx, palette) {
  const radius = 32;
  const notchH = 0.30; // half-angle of wedge notch (radians)
  const topAngle = -Math.PI / 2; // notch centred at 12 o'clock

  // Main pad body (full circle minus notch wedge)
  const pg = ctx.createRadialGradient(-8, -8, 2, 0, 0, radius);
  pg.addColorStop(0, `hsl(${palette.petal + 6}, 82%, 50%)`);
  pg.addColorStop(0.7, `hsl(${palette.petal},     74%, 37%)`);
  pg.addColorStop(1, `hsl(${palette.petal - 8}, 64%, 27%)`);
  ctx.fillStyle = pg;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, topAngle + notchH, topAngle - notchH + Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();

  // Highlight blobs
  ctx.globalAlpha = 0.30;
  ctx.fillStyle = `hsl(${palette.petal + 15}, 88%, 64%)`;
  ctx.beginPath();
  ctx.ellipse(-12, -12, 9, 6, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -6, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Radial veins from centre (distributed across the non-notch area)
  ctx.strokeStyle = `hsl(${palette.petal - 16}, 56%, 24%)`;
  ctx.lineWidth = 0.85;
  const veinCount = 5;
  const arcSpan = Math.PI * 2 - notchH * 2;
  for (let v = 0; v < veinCount; v++) {
    const a = topAngle + notchH + arcSpan * (v + 0.5) / veinCount;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (radius - 5), Math.sin(a) * (radius - 5));
    ctx.stroke();
  }

  // Small water-droplet bubbles scattered on pad
  const bubbles = [[-18, 14, 3.2], [14, 18, 2.4], [-5, 20, 1.8], [20, 4, 1.7], [-22, 1, 1.6]];
  for (const [bx, by, br] of bubbles) {
    ctx.globalAlpha = 0.46;
    ctx.fillStyle = `hsl(${palette.petal + 10}, 90%, 58%)`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = `hsl(${palette.petal + 4}, 72%, 36%)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Magnolia  –  7 cream/blush petals with wavy texture lines, exposed pink
//             inner zone, dark warm-brown irregular blob centre
// ─────────────────────────────────────────────────────────────────────────────
function drawMagnolia(ctx, palette) {
  const petals = 7;

  // Exposed pink inner zone (visible between petals)
  ctx.fillStyle = `hsl(${palette.petal}, 52%, 76%)`;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / petals);

    // Cream petal
    const g = ctx.createLinearGradient(0, -6, 0, -34);
    g.addColorStop(0, `hsl(${palette.petal + 20}, 28%, 94%)`);
    g.addColorStop(0.7, `hsl(${palette.petal + 23}, 22%, 97%)`);
    g.addColorStop(1, `hsl(${palette.petal + 12}, 32%, 88%)`);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-5, -10);
    ctx.bezierCurveTo(-16, -12, -18, -26, -8, -36);
    ctx.bezierCurveTo(-3, -40, 3, -40, 8, -36);
    ctx.bezierCurveTo(18, -26, 16, -12, 5, -10);
    ctx.fill();

    // Pink outer edge stroke
    ctx.strokeStyle = `hsl(${palette.petal}, 45%, 70%)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, -10);
    ctx.bezierCurveTo(-16, -12, -18, -26, -8, -36);
    ctx.bezierCurveTo(-3, -40, 3, -40, 8, -36);
    ctx.bezierCurveTo(18, -26, 16, -12, 5, -10);
    ctx.stroke();

    // Wavy horizontal texture lines across petal
    ctx.strokeStyle = `hsl(${palette.petal + 8}, 28%, 80%)`;
    ctx.lineWidth = 0.8;
    const waveRows = [{ y: -18, w: 7 }, { y: -25, w: 5.5 }, { y: -32, w: 4 }];
    for (const { y, w } of waveRows) {
      ctx.beginPath();
      ctx.moveTo(-w, y);
      for (let x = -w; x < w - 1; x += 3) {
        ctx.quadraticCurveTo(x + 1.5, y - 2.2, x + 3, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // Dark warm-brown irregular blob centre
  const cg = ctx.createRadialGradient(-1, -1, 0, 0, 0, 9);
  cg.addColorStop(0, '#7c3d1a');
  cg.addColorStop(0.5, '#4d2209');
  cg.addColorStop(1, '#3a1a06');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(9, 1);
  ctx.bezierCurveTo(9, 6, 5, 10, 0, 9);
  ctx.bezierCurveTo(-5, 8, -10, 4, -9, 0);
  ctx.bezierCurveTo(-8, -5, -3, -9, 2, -8);
  ctx.bezierCurveTo(7, -7, 9, -4, 9, 1);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────────
export function warmupSprites() {
  SPECIES.forEach((species) => {
    PALETTES[species].forEach((palette) => {
      getFlowerSprite(species, palette);
    });
  });
}


