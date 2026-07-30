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
  const lastPosRef = useRef({}) // last spawn position + timestamp per hand
  const wasOpenRef = useRef({}) // tracks open-palm state per hand, to detect the moment it opens

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
        // 720p is plenty for landmark detection and noticeably lighter than 1080p
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

  // Color palette for flowers — each is [petalHue, centerHue]
  const FLOWER_PALETTES = [
    { petal: 330, center: 45 },  // pink / gold center
    { petal: 300, center: 50 },  // magenta / gold
    { petal: 200, center: 45 },  // sky blue / gold
    { petal: 15,  center: 50 },  // coral / gold
    { petal: 280, center: 48 },  // violet / gold
    { petal: 340, center: 40 },  // rose / amber
  ]

  const SPACING_PX = 18       // spacing between trail flowers (bigger = fewer, cheaper)
  const MAX_FLOWERS = 150     // hard cap so long sessions stay smooth
  const VELOCITY_SCALE = 16   // how strongly finger speed is scaled before inheriting
  const VELOCITY_INHERIT = 0.45 // how much of that scaled speed a flower keeps

  // Trail flower — spawned along the fingertip's path, inherits finger velocity
  const spawnTrailFlower = useCallback((x, y, fingerVx = 0, fingerVy = 0) => {
    const palette = FLOWER_PALETTES[Math.floor(Math.random() * FLOWER_PALETTES.length)]
    flowersRef.current.push({
      x, y,
      vx: fingerVx * VELOCITY_INHERIT + (Math.random() - 0.5) * 0.4,
      vy: fingerVy * VELOCITY_INHERIT + 0.25 + Math.random() * 0.25,
      gravity: 0.002,
      friction: 0.98,
      petalHue: palette.petal,
      centerHue: palette.center,
      petalCount: 5 + Math.floor(Math.random() * 2), // 5 or 6 petals
      size: 14 + Math.random() * 14,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.2,
      life: 1,
      fadeRate: 0.0045,
      glow: 10 + Math.random() * 6,
      throwing: false, // no shadowBlur while true for perf; only burst flowers glow
    })
  }, [])

  // Burst sparkle-flower for the "throw" moment — these DO glow
  const spawnBurstFlower = useCallback((cx, cy) => {
    const palette = FLOWER_PALETTES[Math.floor(Math.random() * FLOWER_PALETTES.length)]
    const angle = Math.random() * Math.PI * 2
    const speed = 6 + Math.random() * 10
    flowersRef.current.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.05,
      friction: 0.96,
      petalHue: palette.petal,
      centerHue: palette.center,
      petalCount: 5 + Math.floor(Math.random() * 2),
      size: 18 + Math.random() * 20,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1,
      fadeRate: 0.02 + Math.random() * 0.015,
      glow: 25 + Math.random() * 15,
      throwing: true,
    })
  }, [])

  // Checks if 4 main fingers are extended (open palm)
  const isPalmOpen = (hand) => {
    const wrist = hand[0]
    const tips = [8, 12, 16, 20]
    const pips = [6, 10, 14, 18]
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

    let extendedCount = 0
    for (let i = 0; i < tips.length; i++) {
      if (dist(hand[tips[i]], wrist) > dist(hand[pips[i]], wrist)) {
        extendedCount++
      }
    }
    return extendedCount >= 4
  }

  // THE MAIN EVENT: throw every flower currently on screen outward with a glowing
  // burst, plus spawn a ring of fresh glowing sparkle-flowers from the palm center.
  const throwFlowers = useCallback((cx, cy) => {
    flowersRef.current.forEach(f => {
      const dx = f.x - cx
      const dy = f.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const kick = 12 + Math.random() * 12
      f.vx = (dx / dist) * kick
      f.vy = (dy / dist) * kick
      f.gravity = 0.03
      f.friction = 0.92
      f.fadeRate = 0.05 + Math.random() * 0.03
      f.rotationSpeed = (Math.random() - 0.5) * 25
      f.throwing = true
      f.glow = 30
    })

    // radiating burst of new glowing flowers
    const burstCount = 14
    for (let i = 0; i < burstCount; i++) {
      spawnBurstFlower(cx, cy)
    }
  }, [spawnBurstFlower])

  // Draws a single flower using layered gradient petals + glowing center.
  // shadowBlur (glow) is only applied to "throwing" flowers — it's expensive,
  // so we skip it for the (much more numerous) trail flowers.
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

    // petals
    for (let i = 0; i < f.petalCount; i++) {
      const petalAngle = (i / f.petalCount) * Math.PI * 2
      ctx.save()
      ctx.rotate(petalAngle)

      const grad = ctx.createLinearGradient(0, 0, 0, -scaledSize)
      grad.addColorStop(0, `hsla(${f.petalHue}, 85%, 55%, ${alpha})`)
      grad.addColorStop(1, `hsla(${f.petalHue}, 95%, 78%, ${alpha * 0.9})`)

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(
        scaledSize * 0.35, -scaledSize * 0.3,
        scaledSize * 0.35, -scaledSize * 0.8,
        0, -scaledSize
      )
      ctx.bezierCurveTo(
        -scaledSize * 0.35, -scaledSize * 0.8,
        -scaledSize * 0.35, -scaledSize * 0.3,
        0, 0
      )
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }

    // center
    const centerR = scaledSize * 0.28
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerR)
    centerGrad.addColorStop(0, `hsla(${f.centerHue}, 100%, 85%, ${alpha})`)
    centerGrad.addColorStop(1, `hsla(${f.centerHue}, 100%, 55%, ${alpha * 0.7})`)
    ctx.beginPath()
    ctx.arc(0, 0, centerR, 0, Math.PI * 2)
    ctx.fillStyle = centerGrad
    ctx.fill()

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

      // Only resize the canvas when the video's actual dimensions change —
      // resizing clears + reallocates the backing buffer, so doing it every
      // frame is wasteful.
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

            // Edge-trigger: only fires the instant the palm opens, not every frame it's open
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
                const dt = Math.max(now - last.t, 1) // ms since last update, avoid div by 0

                let dx = x - last.x
                let dy = y - last.y
                let dist = Math.hypot(dx, dy)

                // finger's actual speed, scaled to a usable range for flower velocity
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

            // fingertip marker (kept lightweight — no shadowBlur)
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI)
            ctx.fillStyle = open ? 'rgba(255,182,193,0.9)' : 'rgba(255,255,255,0.6)'
            ctx.fill()
          })
        }
      }

      // Cap flower count so it doesn't grow unbounded during long sessions
      if (flowersRef.current.length > MAX_FLOWERS) {
        flowersRef.current = flowersRef.current.slice(flowersRef.current.length - MAX_FLOWERS)
      }

      flowersRef.current = flowersRef.current.filter(f => f.life > 0)
      flowersRef.current.forEach(f => {
        f.vy += f.gravity
        f.vx *= f.friction ?? 1
        f.vy *= f.friction ?? 1
        f.x += f.vx
        f.y += f.vy
        f.rotation += f.rotationSpeed
        f.life -= f.fadeRate

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