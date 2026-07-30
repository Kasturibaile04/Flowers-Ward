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
  const lastPosRef = useRef({}) // last spawn position per hand, for distance-based spawning
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
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
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

  const FLOWER_EMOJIS = ['🌸', '🌷', '🌼', '🌺', '🌻']
  const SPACING_PX = 16 // smaller = denser trail of flowers

  // Trail flower — spawned along the fingertip's path
  const spawnTrailFlower = useCallback((x, y) => {
    flowersRef.current.push({
      x, y,
      vx: 0,
      vy: 0.3 + Math.random() * 0.3,
      gravity: 0,
      friction: 1,
      emoji: FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)],
      size: 22 + Math.random() * 18,
      rotation: Math.random() * 360,
      rotationSpeed: 0,
      life: 1,
      fadeRate: 0.006,
    })
  }, [])

  // Checks if 4 main fingers are extended (open palm)
  const isPalmOpen = (hand) => {
    const wrist = hand[0]
    const tips = [8, 12, 16, 20]   // fingertips: index, middle, ring, pinky
    const pips = [6, 10, 14, 18]   // corresponding middle joints
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

    let extendedCount = 0
    for (let i = 0; i < tips.length; i++) {
      if (dist(hand[tips[i]], wrist) > dist(hand[pips[i]], wrist)) {
        extendedCount++
      }
    }
    return extendedCount >= 4
  }

  // THE MAIN EVENT: wipe every flower currently on screen, fast.
  // Each flower gets a quick outward kick away from the palm center,
  // plus a very high fadeRate so it's gone within a handful of frames
  // (roughly 150-200ms) instead of drifting/fading slowly.
  const clearAllFlowers = useCallback((cx, cy) => {
    flowersRef.current.forEach(f => {
      const dx = f.x - cx
      const dy = f.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const kick = 14 + Math.random() * 10 // fast outward burst speed
      f.vx = (dx / dist) * kick
      f.vy = (dy / dist) * kick
      f.gravity = 0
      f.friction = 0.9
      f.fadeRate = 0.25 + Math.random() * 0.15 // life=1 -> gone in ~4-6 frames
      f.rotationSpeed = (Math.random() - 0.5) * 40 // fast spin as it vanishes
    })
  }, [])

  const detectLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const render = () => {
      if (!video || video.readyState < 2) {
        requestAnimationFrame(render)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
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
              // Palm center = average of all 21 landmarks
              const cx = hand.reduce((sum, p) => sum + p.x, 0) / hand.length * canvas.width
              const cy = hand.reduce((sum, p) => sum + p.y, 0) / hand.length * canvas.height

              clearAllFlowers(cx, cy)
            }
            wasOpenRef.current[key] = open

            // Distance-based trail spawning (only while NOT open-palm-throwing)
            if (!open) {
              const last = lastPosRef.current[key]
              if (!last) {
                spawnTrailFlower(x, y)
                lastPosRef.current[key] = { x, y }
              } else {
                let dx = x - last.x
                let dy = y - last.y
                let dist = Math.hypot(dx, dy)

                while (dist >= SPACING_PX) {
                  const ratio = SPACING_PX / dist
                  const nx = last.x + dx * ratio
                  const ny = last.y + dy * ratio
                  spawnTrailFlower(nx, ny)
                  last.x = nx
                  last.y = ny
                  dx = x - last.x
                  dy = y - last.y
                  dist = Math.hypot(dx, dy)
                }
              }
            } else {
              // reset trail anchor so it doesn't jump/connect once fingers close again
              lastPosRef.current[key] = { x, y }
            }

            // fingertip marker
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI)
            ctx.fillStyle = open ? 'rgba(255,182,193,0.8)' : 'rgba(255,255,255,0.6)'
            ctx.fill()
          })
        }
      }

      // Draw + animate all flowers
      flowersRef.current = flowersRef.current.filter(f => f.life > 0)
      flowersRef.current.forEach(f => {
        f.vy += f.gravity
        f.vx *= f.friction ?? 1
        f.vy *= f.friction ?? 1
        f.x += f.vx
        f.y += f.vy
        f.rotation += f.rotationSpeed
        f.life -= f.fadeRate

        ctx.save()
        ctx.globalAlpha = Math.max(f.life, 0)
        ctx.translate(f.x, f.y)
        ctx.rotate((f.rotation * Math.PI) / 180)
        const scaledSize = f.size * (0.4 + 0.6 * Math.max(f.life, 0))
        ctx.font = `${scaledSize}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(f.emoji, 0, 0)
        ctx.restore()
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