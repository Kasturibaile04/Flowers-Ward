import { useRef, useState, useEffect, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState(null)

  const handLandmarkerRef = useRef(null)
  const flowersRef = useRef([])
  const lastPosRef = useRef({})
  const wasOpenRef = useRef({})

  useEffect(() => {
    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      })
    }
    setup()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      })
      videoRef.current.srcObject = stream
      setCameraOn(true)
      setError(null)
      videoRef.current.onloadeddata = () => detectLoop()
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Could not access camera. Please allow camera permission and try again.')
    }
  }

  // ---- Flower species definitions ----
  const SPECIES = ['sunflower', 'daisy', 'bluebell', 'ranunculus', 'tulip']

  const PALETTES = {
    sunflower: [{ petal: 46, center: 28 }, { petal: 40, center: 22 }],
    daisy:     [{ petal: 0,  center: 48, petalLight: true }, { petal: 340, center: 45, petalLight: true }],
    bluebell:  [{ petal: 220, center: 50 }, { petal: 260, center: 48 }, { petal: 205, center: 45 }],
    ranunculus:[{ petal: 320, center: 40 }, { petal: 300, center: 45 }, { petal: 15, center: 40 }],
    tulip:     [{ petal: 350, center: 40 }, { petal: 280, center: 45 }, { petal: 10, center: 35 }],
  }

  const SPACING_PX = 14           // tighter spacing = flowers appear faster along the trail
  const MAX_FLOWERS = 130
  const VELOCITY_SCALE = 20       // was 16 — trail flowers pick up speed faster
  const VELOCITY_INHERIT = 0.55   // was 0.45 — stronger inherited speed

  const THROW_VISIBLE_MS = 2000   // throw animation stays fully visible for ~2s
  const THROW_FADE_MS = 150       // then disappears fast

  const randomSpecies = () => SPECIES[Math.floor(Math.random() * SPECIES.length)]
  const randomPalette = (species) => {
    const pool = PALETTES[species]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const makeFlower = (x, y, vx, vy, throwing) => {
    const species = randomSpecies()
    const palette = randomPalette(species)
    return {
      x, y, vx, vy,
      species,
      petalHue: palette.petal,
      centerHue: palette.center,
      petalLight: !!palette.petalLight,
      size: throwing ? 20 + Math.random() * 20 : 16 + Math.random() * 16,
      rotation: Math.random() * 360,
      rotationSpeed: throwing ? (Math.random() - 0.5) * 14 : (Math.random() - 0.5) * 1.2,
      gravity: throwing ? 0.04 : 0.002,
      friction: throwing ? 0.95 : 0.98,
      life: 1,
      fadeRate: throwing ? 0 : 0.004, // throwing flowers use timestamp-based life instead, see draw loop
      glow: throwing ? 25 + Math.random() * 15 : 0,
      throwing,
      spawnTime: throwing ? performance.now() : null,
    }
  }

  const spawnTrailFlower = useCallback((x, y, fingerVx = 0, fingerVy = 0) => {
    const vx = fingerVx * VELOCITY_INHERIT + (Math.random() - 0.5) * 0.4
    const vy = fingerVy * VELOCITY_INHERIT + 0.25 + Math.random() * 0.25
    flowersRef.current.push(makeFlower(x, y, vx, vy, false))
  }, [])

  const spawnBurstFlower = useCallback((cx, cy) => {
    const angle = Math.random() * Math.PI * 2
    const speed = 6 + Math.random() * 10
    flowersRef.current.push(
      makeFlower(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, true)
    )
  }, [])

  const isPalmOpen = (hand) => {
    const wrist = hand[0]
    const tips = [8, 12, 16, 20]
    const pips = [6, 10, 14, 18]
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    let extendedCount = 0
    for (let i = 0; i < tips.length; i++) {
      if (dist(hand[tips[i]], wrist) > dist(hand[pips[i]], wrist)) extendedCount++
    }
    return extendedCount >= 4
  }

  const throwFlowers = useCallback((cx, cy) => {
    const now = performance.now()
    flowersRef.current.forEach(f => {
      const dx = f.x - cx
      const dy = f.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const kick = 18 + Math.random() * 16 // faster outward kick
      f.vx = (dx / dist) * kick
      f.vy = (dy / dist) * kick
      f.gravity = 0.04
      f.friction = 0.95
      f.rotationSpeed = (Math.random() - 0.5) * 25
      f.throwing = true
      f.glow = 30
      f.spawnTime = now // resets the 2s visible timer for this flower
    })
    for (let i = 0; i < 14; i++) spawnBurstFlower(cx, cy)
  }, [spawnBurstFlower])

  // ---- Species draw routines ----

  const drawSunflower = (ctx, f, alpha, size) => {
    const petalCount = 13
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2
      ctx.save()
      ctx.rotate(a)
      const grad = ctx.createLinearGradient(0, 0, 0, -size)
      grad.addColorStop(0, `hsla(${f.petalHue}, 90%, 45%, ${alpha})`)
      grad.addColorStop(1, `hsla(${f.petalHue}, 95%, 62%, ${alpha * 0.95})`)
      ctx.beginPath()
      ctx.moveTo(-size * 0.12, 0)
      ctx.quadraticCurveTo(-size * 0.16, -size * 0.65, 0, -size)
      ctx.quadraticCurveTo(size * 0.16, -size * 0.65, size * 0.12, 0)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
    const r = size * 0.32
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    grad.addColorStop(0, `hsla(${f.centerHue}, 80%, 30%, ${alpha})`)
    grad.addColorStop(1, `hsla(${f.centerHue}, 70%, 18%, ${alpha})`)
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.fillStyle = `hsla(${f.centerHue}, 60%, 12%, ${alpha * 0.6})`
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = Math.random() * r * 0.8
      ctx.beginPath()
      ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawDaisy = (ctx, f, alpha, size) => {
    const petalCount = 10
    const lightness = f.petalLight ? 96 : 80
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2
      ctx.save()
      ctx.rotate(a)
      ctx.beginPath()
      ctx.ellipse(0, -size * 0.55, size * 0.14, size * 0.42, 0, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${f.petalHue}, 60%, ${lightness}%, ${alpha})`
      ctx.fill()
      ctx.restore()
    }
    const r = size * 0.22
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    grad.addColorStop(0, `hsla(${f.centerHue}, 100%, 78%, ${alpha})`)
    grad.addColorStop(1, `hsla(${f.centerHue}, 100%, 50%, ${alpha})`)
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  }

  const drawBluebell = (ctx, f, alpha, size) => {
    const petalCount = 5
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2
      ctx.save()
      ctx.rotate(a)
      const grad = ctx.createLinearGradient(0, 0, 0, -size)
      grad.addColorStop(0, `hsla(${f.petalHue}, 70%, 45%, ${alpha})`)
      grad.addColorStop(1, `hsla(${f.petalHue}, 85%, 72%, ${alpha * 0.9})`)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(size * 0.3, -size * 0.5, 0, -size)
      ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, 0, 0)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
    const r = size * 0.18
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${f.centerHue}, 100%, 80%, ${alpha})`
    ctx.fill()
  }

  const drawRanunculus = (ctx, f, alpha, size) => {
    const rings = [
      { count: 8, rStart: size * 0.9, petalLen: size * 0.55, light: 0 },
      { count: 7, rStart: size * 0.5, petalLen: size * 0.45, light: 10 },
      { count: 5, rStart: size * 0.15, petalLen: size * 0.3, light: 20 },
    ]
    rings.forEach(ring => {
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2 + (ring.rStart * 0.01)
        ctx.save()
        ctx.rotate(a)
        ctx.translate(0, -ring.rStart * 0.3)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, ring.petalLen)
        grad.addColorStop(0, `hsla(${f.petalHue}, 80%, ${55 + ring.light}%, ${alpha})`)
        grad.addColorStop(1, `hsla(${f.petalHue}, 90%, ${70 + ring.light}%, ${alpha * 0.85})`)
        ctx.beginPath()
        ctx.ellipse(0, 0, ring.petalLen * 0.45, ring.petalLen * 0.6, 0, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }
    })
    const r = size * 0.14
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${f.centerHue}, 90%, 55%, ${alpha})`
    ctx.fill()
  }

  const drawTulip = (ctx, f, alpha, size) => {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      ctx.save()
      ctx.rotate(a)
      const grad = ctx.createLinearGradient(0, 0, 0, -size)
      grad.addColorStop(0, `hsla(${f.petalHue}, 75%, 40%, ${alpha})`)
      grad.addColorStop(1, `hsla(${f.petalHue}, 85%, 65%, ${alpha * 0.9})`)
      ctx.beginPath()
      ctx.moveTo(-size * 0.3, 0)
      ctx.bezierCurveTo(-size * 0.35, -size * 0.6, -size * 0.15, -size, 0, -size)
      ctx.bezierCurveTo(size * 0.15, -size, size * 0.35, -size * 0.6, size * 0.3, 0)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
    const r = size * 0.12
    ctx.beginPath()
    ctx.arc(0, size * 0.05, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${f.centerHue}, 90%, 45%, ${alpha})`
    ctx.fill()
  }

  const DRAW_FN = {
    sunflower: drawSunflower,
    daisy: drawDaisy,
    bluebell: drawBluebell,
    ranunculus: drawRanunculus,
    tulip: drawTulip,
  }

  const drawFlower = (ctx, f) => {
    const alpha = Math.max(f.life, 0)
    const scaledSize = f.size * (0.5 + 0.5 * alpha)

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(f.x, f.y)
    ctx.rotate((f.rotation * Math.PI) / 180)

    if (f.throwing) {
      ctx.shadowColor = `hsla(${f.petalHue}, 100%, 70%, 0.9)`
      ctx.shadowBlur = f.glow
    } else {
      ctx.shadowBlur = 0
    }

    DRAW_FN[f.species](ctx, f, alpha, scaledSize)

    ctx.restore()
  }

  const detectLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const render = () => {
      if (!video || video.readyState < 2) {
        requestAnimationFrame(render)
        return
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (handLandmarkerRef.current) {
        const results = handLandmarkerRef.current.detectForVideo(video, performance.now())

        if (results.landmarks) {
          results.landmarks.forEach((hand, handIndex) => {
            const key = `hand-${handIndex}`
            const indexTip = hand[8]
            const x = indexTip.x * canvas.width
            const y = indexTip.y * canvas.height

            const open = isPalmOpen(hand)

            if (open && !wasOpenRef.current[key]) {
              const cx = hand.reduce((sum, p) => sum + p.x, 0) / hand.length * canvas.width
              const cy = hand.reduce((sum, p) => sum + p.y, 0) / hand.length * canvas.height
              throwFlowers(cx, cy)
            }
            wasOpenRef.current[key] = open

            if (!open) {
              const last = lastPosRef.current[key]
              const now = performance.now()

              if (!last) {
                spawnTrailFlower(x, y)
                lastPosRef.current[key] = { x, y, t: now }
              } else {
                const dt = Math.max(now - last.t, 1)
                let dx = x - last.x
                let dy = y - last.y
                let dist = Math.hypot(dx, dy)

                const fingerVx = (dx / dt) * VELOCITY_SCALE
                const fingerVy = (dy / dt) * VELOCITY_SCALE

                while (dist >= SPACING_PX) {
                  const ratio = SPACING_PX / dist
                  const nx = last.x + dx * ratio
                  const ny = last.y + dy * ratio
                  spawnTrailFlower(nx, ny, fingerVx, fingerVy)
                  last.x = nx
                  last.y = ny
                  dx = x - last.x
                  dy = y - last.y
                  dist = Math.hypot(dx, dy)
                }
                last.t = now
              }
            } else {
              lastPosRef.current[key] = { x, y, t: performance.now() }
            }

            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI)
            ctx.fillStyle = open ? 'rgba(255,182,193,0.9)' : 'rgba(255,255,255,0.6)'
            ctx.fill()
          })
        }
      }

      if (flowersRef.current.length > MAX_FLOWERS) {
        flowersRef.current = flowersRef.current.slice(flowersRef.current.length - MAX_FLOWERS)
      }

      const nowTs = performance.now()

      flowersRef.current = flowersRef.current.filter(f => f.life > 0)
      flowersRef.current.forEach(f => {
        f.vy += f.gravity
        f.vx *= f.friction ?? 1
        f.vy *= f.friction ?? 1
        f.x += f.vx
        f.y += f.vy
        f.rotation += f.rotationSpeed

        if (f.throwing) {
          // stays fully visible for THROW_VISIBLE_MS, then fades out fast over THROW_FADE_MS
          const elapsed = nowTs - f.spawnTime
          if (elapsed < THROW_VISIBLE_MS) {
            f.life = 1
          } else {
            const fadeElapsed = elapsed - THROW_VISIBLE_MS
            f.life = Math.max(1 - fadeElapsed / THROW_FADE_MS, 0)
          }
        } else {
          f.life -= f.fadeRate
        }

        drawFlower(ctx, f)
      })

      requestAnimationFrame(render)
    }

    render()
  }

  return (
    <>
      <div className="camera-screen" style={{ display: cameraOn ? 'block' : 'none' }}>
        <video ref={videoRef} autoPlay playsInline className="camera-video" />
        <canvas ref={canvasRef} className="camera-canvas" />
        <h1 className="camera-title">Flower Garden</h1>
      </div>

      {!cameraOn && (
        <div className="landing">
          <nav className="nav">
            <div className="nav-links">
              <span>Plants</span>
              <span>Gestures</span>
              <span>About</span>
            </div>
            <div className="nav-tag">Made with 🌷</div>
          </nav>

          <span className="flower flower-1">🌸</span>
          <span className="flower flower-2">🌷</span>
          <span className="flower flower-3">🌼</span>
          <span className="flower flower-4">🌺</span>
          <span className="flower flower-5">🌸</span>
          <span className="flower flower-6">🌻</span>
          <span className="flower flower-7">🌷</span>
          <span className="flower flower-8">🌼</span>
          <span className="flower flower-9">🌻</span>
          <span className="flower flower-10">🌸</span>
          <span className="flower flower-11">🌸</span>
          <span className="flower flower-12">🌺</span>
          <span className="flower flower-13">🌺</span>
          <span className="flower flower-14">🌺</span>
          <span className="flower flower-15">🌸</span>

          <div className="hero">
            <h1 className="hero-title">Grow flowers <br /> with your hands</h1>
            <button className="hero-btn" onClick={startCamera}>
              Start Camera
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      )}
    </>
  )
}

export default App