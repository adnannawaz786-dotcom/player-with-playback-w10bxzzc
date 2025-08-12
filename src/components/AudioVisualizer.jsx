import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const AudioVisualizer = ({ audioElement, isPlaying, className = '' }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const dataArrayRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [visualizerType, setVisualizerType] = useState('bars')

  const initializeAudioContext = useCallback(async () => {
    if (!audioElement || audioContextRef.current) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      
      const source = audioContext.createMediaElementSource(audioElement)
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source
      dataArrayRef.current = dataArray
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Error initializing audio context:', error)
    }
  }, [audioElement])

  const drawBarsVisualizer = useCallback((canvas, ctx, dataArray) => {
    const width = canvas.width
    const height = canvas.height
    const barWidth = (width / dataArray.length) * 2.5
    let barHeight
    let x = 0

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(0.5, '#8b5cf6')
    gradient.addColorStop(1, '#ec4899')

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * height * 0.8

      ctx.fillStyle = gradient
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)

      x += barWidth + 1
    }
  }, [])

  const drawCircularVisualizer = useCallback((canvas, ctx, dataArray) => {
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 4

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(0.5, '#8b5cf6')
    gradient.addColorStop(1, '#ec4899')

    ctx.strokeStyle = gradient
    ctx.lineWidth = 3

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2
      const amplitude = (dataArray[i] / 255) * radius
      
      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + amplitude)
      const y2 = centerY + Math.sin(angle) * (radius + amplitude)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }, [])

  const drawWaveformVisualizer = useCallback((canvas, ctx, dataArray) => {
    const width = canvas.width
    const height = canvas.height
    const sliceWidth = width / dataArray.length

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(0.5, '#8b5cf6')
    gradient.addColorStop(1, '#ec4899')

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()

    let x = 0
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 255) * height
      const y = height / 2 + (v - height / 2) * 0.5

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()
  }, [])

  const draw = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current)

    switch (visualizerType) {
      case 'bars':
        drawBarsVisualizer(canvas, ctx, dataArrayRef.current)
        break
      case 'circular':
        drawCircularVisualizer(canvas, ctx, dataArrayRef.current)
        break
      case 'waveform':
        drawWaveformVisualizer(canvas, ctx, dataArrayRef.current)
        break
      default:
        drawBarsVisualizer(canvas, ctx, dataArrayRef.current)
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw)
    }
  }, [visualizerType, isPlaying, drawBarsVisualizer, drawCircularVisualizer, drawWaveformVisualizer])

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const container = canvas.parentElement
    
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }, [])

  useEffect(() => {
    if (audioElement && !isInitialized) {
      initializeAudioContext()
    }
  }, [audioElement, isInitialized, initializeAudioContext])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [resizeCanvas])

  useEffect(() => {
    if (isPlaying && isInitialized && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }

    if (isPlaying && isInitialized) {
      draw()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isInitialized, draw])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  const visualizerTypes = [
    { id: 'bars', label: 'Bars', icon: '▬' },
    { id: 'circular', label: 'Circular', icon: '◯' },
    { id: 'waveform', label: 'Wave', icon: '〜' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Visualizer Type Selector */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {visualizerTypes.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisualizerType(type.id)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              visualizerType === type.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            title={type.label}
          >
            {type.icon}
          </motion.button>
        ))}
      </div>

      {/* Canvas Container */}
      <div className="w-full h-full min-h-[200px] relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
        
        {/* Fallback when not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Play music to see visualization</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Animated Background Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      </div>
    </motion.div>
  )
}

export default AudioVisualizer