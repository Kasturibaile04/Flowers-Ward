import { useRef, useState, useEffect } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import FlowerEngine from './engine/FlowerEngine'
import FlowerRenderer from './engine/FlowerRenderer'
import { warmupSprites } from './engine/FlowerSprites'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState(null)

  const handLandmarkerRef = useRef(null)
  const engineRef = useRef(null)
  const rendererRef = useRef(null)
  const animFrameIdRef = useRef(null)
  const detectedLandmarksRef = useRef([])
  const handStateRef = useRef(new Map())

  const lastVideoTimeRef = useRef(-1)
  const lastFrameTimeRef = useRef(0)

  useEffect(() => {
    warmupSprites()

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        let landmarker
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          })
        } catch (gpuErr) {
          console.warn('GPU delegate fallback to CPU:', gpuErr)
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          })
        }
        handLandmarkerRef.current = landmarker
      } catch (err) {
        console.error('MediaPipe initialization error:', err)
      }
    }

    setup()

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraOn(true)
        setError(null)
        videoRef.current.onloadeddata = () => detectLoop()
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Could not access camera. Please allow camera permission and try again.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
    }
    setCameraOn(false)
    detectedLandmarksRef.current = []
    handStateRef.current.clear()
  }

  const getFingerExtension = (hand, tipIdx, mcpIdx) => {
    const wrist = hand[0]
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    const dMcp = Math.max(dist(hand[mcpIdx], wrist), 0.001)
    const dTip = dist(hand[tipIdx], wrist)
    return dTip / dMcp
  }

  const isPointingFinger = (hand) => {
    const extIndex = getFingerExtension(hand, 8, 5)
    const extMiddle = getFingerExtension(hand, 12, 9)
    const extRing = getFingerExtension(hand, 16, 13)

    const indexExtended = extIndex > 1.18
    const indexDominant = (extIndex - extMiddle > 0.08) && (extIndex - extRing > 0.10)

    return indexExtended && indexDominant
  }

  const isOpenHand = (hand) => {
    const extIndex = getFingerExtension(hand, 8, 5)
    const extMiddle = getFingerExtension(hand, 12, 9)
    const extRing = getFingerExtension(hand, 16, 13)
    const extPinky = getFingerExtension(hand, 20, 17)

    return extIndex > 1.30 && extMiddle > 1.30 && extRing > 1.30 && extPinky > 1.30
  }

  const detectLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    engineRef.current = new FlowerEngine()
    rendererRef.current = new FlowerRenderer(ctx, canvas.width, canvas.height)

    lastFrameTimeRef.current = performance.now()

    const render = () => {
      if (!video || video.readyState < 2) {
        animFrameIdRef.current = requestAnimationFrame(render)
        return
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        rendererRef.current.resize(canvas.width, canvas.height)
      }

      const now = performance.now()
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.05)
      lastFrameTimeRef.current = now

      // Unthrottled detection on every video frame update
      if (handLandmarkerRef.current && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime

        const timestamp = performance.now()
        const results = handLandmarkerRef.current.detectForVideo(video, timestamp)

        if (results && results.landmarks && results.landmarks.length > 0) {
          detectedLandmarksRef.current = results.landmarks
          const activeKeys = new Set()

          results.landmarks.forEach((hand, handIndex) => {
            const key = `hand-${handIndex}`
            activeKeys.add(key)

            let state = handStateRef.current.get(key)
            if (!state) {
              state = { lastX: null, lastY: null, pointingBuffer: 0 }
              handStateRef.current.set(key, state)
            }

            const rawX = hand[8].x * canvas.width
            const rawY = hand[8].y * canvas.height

            // Smooth position LERP for continuous motion
            const targetX = state.lastX === null ? rawX : state.lastX + (rawX - state.lastX) * 0.85
            const targetY = state.lastY === null ? rawY : state.lastY + (rawY - state.lastY) * 0.85
            state.lastX = targetX
            state.lastY = targetY

            if (isOpenHand(hand)) {
              state.pointingBuffer = 0
              const centerX = hand[9].x * canvas.width
              const centerY = hand[9].y * canvas.height
              engineRef.current.scatter(centerX, centerY)
            } else if (isPointingFinger(hand)) {
              state.pointingBuffer = 10
              engineRef.current.updateFinger(key, targetX, targetY)
            } else if (state.pointingBuffer > 0) {
              state.pointingBuffer--
              engineRef.current.updateFinger(key, targetX, targetY)
            } else {
              engineRef.current.stopFinger(key)
            }
          })

          for (const [key, state] of handStateRef.current.entries()) {
            if (!activeKeys.has(key)) {
              if (state.pointingBuffer > 0) {
                state.pointingBuffer--
                if (state.lastX !== null && state.lastY !== null) {
                  engineRef.current.updateFinger(key, state.lastX, state.lastY)
                }
              } else {
                engineRef.current.stopFinger(key)
                handStateRef.current.delete(key)
              }
            }
          }
        } else {
          // If ML frame drops during rapid movement, use hysteresis buffer
          detectedLandmarksRef.current = []
          for (const [key, state] of handStateRef.current.entries()) {
            if (state.pointingBuffer > 0) {
              state.pointingBuffer--
              if (state.lastX !== null && state.lastY !== null) {
                engineRef.current.updateFinger(key, state.lastX, state.lastY)
              }
            } else {
              engineRef.current.stopFinger(key)
              handStateRef.current.delete(key)
            }
          }
        }
      }

      // Render hand skeleton & flowers
      rendererRef.current.render(
        engineRef.current.getFlowers(),
        dt,
        detectedLandmarksRef.current
      )

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    render()
  }

  return (
    <div className="app-container">
      <div className="camera-screen" style={{ display: cameraOn ? 'block' : 'none' }}>
        <video ref={videoRef} autoPlay playsInline className="camera-video" />
        <canvas ref={canvasRef} className="camera-canvas" />

        <div className="camera-hud">
          Point to plant · Open your hand to scatter
        </div>

        <button className="close-btn" onClick={stopCamera} aria-label="Turn off camera">
          ✕
        </button>
      </div>

      {!cameraOn && (
        <>
          {/* 
            --- WARM CREAM THEME (COMMENTED OUT) ---
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
                <h1 className="hero-title">Grow flowers <br />with your hands</h1>
                <button className="hero-btn" onClick={startCamera}>
                  Start Camera
                </button>
                {error && <p className="error-text">{error}</p>}
              </div>
            </div>
          */}

          {/* --- ORIGINAL DARK THEME --- */}
          <div className="landing">
            <div className="hero">
              <h1 className="hero-title">Flower Wand</h1>
              <p className="hero-subtitle">
                Point your index finger to grow flowers.<br />
                Open your hand to scatter them.
              </p>
              <button className="hero-btn" onClick={startCamera}>
                Turn on camera
              </button>
              {error && <p className="error-text">{error}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
