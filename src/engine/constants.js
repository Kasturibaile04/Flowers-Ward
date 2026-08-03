// ===============================
// Rendering
// ===============================

export const TARGET_RENDER_FPS = 60
export const TARGET_DETECT_FPS = 30

export const MAX_FLOWERS = 1200

export const OFFSCREEN_MARGIN = 80

// ===============================
// Physics
// ===============================

export const GRAVITY = 0
export const THROW_GRAVITY = 1500

export const AIR_RESISTANCE = 0.99
export const THROW_RESISTANCE = 0.95

export const VELOCITY_INHERIT = 0.0
export const VELOCITY_SCALE = 0.0

export const FLOWER_SPACING = 16

// ===============================
// Flower Sizes
// ===============================

export const MIN_SIZE = 16
export const MAX_SIZE = 34

export const THROW_MIN_SIZE = 22
export const THROW_MAX_SIZE = 42

// ===============================
// Species
// ===============================

// Species appear proportional to how many times they're listed.
// Doubled entries = twice as likely to spawn.
export const SPECIES = [
    "sunflower",
    "daisy", "daisy",      // 2 variants as requested
    "bluebell",
    "ranunculus",
    "tulip",
    "phlox", "phlox",
    "sakura", "sakura",
    "frangipani", "frangipani",
    "crocus",
    "tropica", "tropica",
    "clover",
    "buttercup",
    "cosmos", "cosmos",
    "waterbloom", "waterbloom",
    "pressed", "pressed",
    "lilypad",
    "magnolia", "magnolia",
    "watercolorblue", "watercolorblue", // (new)
    "starflower", "starflower",         // (new)
    "poppy", "poppy",                   // (new)
    "swirlrose", "swirlrose",           // (new)
    "crossflower", "crossflower",       // (new)
]

// ===============================
// Color Palettes
// ===============================

export const PALETTES = {
    sunflower: [
        {
            petal: 46,
            center: 28
        },
        {
            petal: 40,
            center: 22
        }
    ],

    daisy: [
        { petal: 0, center: 48, petalLight: true },
        { petal: 340, center: 45, petalLight: true }
    ],

    bluebell: [
        {
            petal: 220,
            center: 50
        },
        {
            petal: 260,
            center: 48
        },
        {
            petal: 205,
            center: 45
        }
    ],

    ranunculus: [
        {
            petal: 320,
            center: 40
        },
        {
            petal: 300,
            center: 45
        },
        {
            petal: 15,
            center: 40
        }
    ],

    tulip: [
        {
            petal: 350,
            center: 40
        },
        {
            petal: 280,
            center: 45
        },
        {
            petal: 10,
            center: 35
        }
    ],

    // ── New species ──────────────────────────────────────

    // Flat round-petal cartoon flower (image 1)
    phlox: [
        { petal: 330, center: 20 },
        { petal: 350, center: 15 },
        { petal: 310, center: 25 },
        { petal: 345, center: 18 },
        { petal: 10, center: 22 }
    ],

    // Cherry blossom / soft asymmetric petals + stamens (image 2)
    sakura: [
        { petal: 340, center: 350 },
        { petal: 355, center: 340 },
        { petal: 325, center: 355 }
    ],

    // Plumeria / frangipani – overlapping petals + stamens + yellow dot (image 3)
    frangipani: [
        { petal: 340, center: 48 },
        { petal: 15, center: 45 },
        { petal: 355, center: 50 },
        { petal: 320, center: 46 }
    ],

    // Crocus – long narrow petals, veins, orange stamens, green leaves
    crocus: [
        { petal: 270, center: 260 },
        { petal: 260, center: 270 },
        { petal: 285, center: 265 },
        { petal: 250, center: 275 }
    ],

    // Watercolour plumeria – translucent layered orange/coral petals
    tropica: [
        { petal: 25, center: 18 },
        { petal: 15, center: 10 },
        { petal: 35, center: 25 },
        { petal: 8, center: 15 }
    ],

    // Four-leaf clover – heart leaves with veins + curved stem
    clover: [
        { petal: 130, center: 120 },
        { petal: 140, center: 130 },
        { petal: 125, center: 115 }
    ],

    // Sketchy yellow daisy – elongated petals with white streak + brown centre
    buttercup: [
        { petal: 50, center: 30 },
        { petal: 45, center: 25 },
        { petal: 55, center: 28 }
    ],

    // Pink wild rose – wide ruffled petals, white highlights, golden centre
    cosmos: [
        { petal: 340, center: 45 },
        { petal: 330, center: 40 },
        { petal: 350, center: 48 },
        { petal: 320, center: 42 }
    ],

    // Watercolour hibiscus – translucent petals, magenta centre, star midpoint
    waterbloom: [
        { petal: 330, center: 315 },
        { petal: 340, center: 322 },
        { petal: 350, center: 330 },
        { petal: 320, center: 308 }
    ],

    // Pressed / dried 4-petal flower – muted purple, veins, orange centre
    pressed: [
        { petal: 290, center: 38 },
        { petal: 270, center: 42 },
        { petal: 310, center: 40 },
        { petal: 280, center: 36 }
    ],

    // Cartoon lily pad – round green disk with notch, veins, droplets
    lilypad: [
        { petal: 130, center: 120 },
        { petal: 140, center: 128 },
        { petal: 122, center: 115 }
    ],

    // Cream magnolia / anemone – 7 petals with wavy lines, brown blob centre
    magnolia: [
        { petal: 350, center: 22 },
        { petal: 340, center: 18 },
        { petal: 5, center: 25 },
        { petal: 330, center: 20 }
    ],

    // Soft translucent blue 5-petal flower with yellow star centre
    watercolorblue: [
        { petal: 200, center: 55 },
        { petal: 190, center: 50 },
        { petal: 210, center: 60 }
    ],

    // Bright yellow star-shaped graphic flower
    starflower: [
        { petal: 55, center: 30 },
        { petal: 50, center: 25 },
        { petal: 60, center: 35 }
    ],

    // Red poppy with black/yellow dotted centre
    poppy: [
        { petal: 355, center: 0 },
        { petal: 0, center: 10 },
        { petal: 350, center: 5 }
    ],

    // Stylized swirl rose (concentric rough circles in purple/pink/orange)
    swirlrose: [
        { petal: 280, center: 290 }, // Purple
        { petal: 330, center: 340 }, // Pink
        { petal: 35, center: 20 }    // Orange
    ],

    // Simple 4-petal cross-shaped flower (deep magenta/purple)
    crossflower: [
        { petal: 310, center: 50 }, // Magenta
        { petal: 290, center: 50 }, // Deep purple
        { petal: 325, center: 45 }  // Pinkish purple
    ]
}
