import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Shuffle, Repeat } from 'lucide-react'
import { usePlayerContext } from '../context/PlayerContext'
import AudioVisualizer from './AudioVisualizer'
import Playlist from './Playlist'
import Controls from './Controls'

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    playlist,
    playTrack,
    pauseTrack,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
    addTrack,
    isLoading,
    error,
    isMuted,
    toggleMute,
    isShuffled,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = usePlayerContext()

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file)
        addTrack({
          id: Date.now() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Unknown Artist',
          url: url,
          duration: 0
        })
      }
    })
    event.target.value = ''
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (event) => {
    const progressBar = event.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const width = rect.width
    const percentage = clickX / width
    const newTime = percentage * duration
    seekTo(newTime)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Music Player
          </h1>
          <p className="text-gray-300">Upload and play your favorite tracks</p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 text-center"
        >
          <label className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105">
            <Upload size={20} />
            Upload Music
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              {/* Current Track Info */}
              <div className="text-center mb-8">
                {currentTrack ? (
                  <>
                    <motion.div
                      key={currentTrack.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                      <div className="text-6xl">🎵</div>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
                    <p className="text-gray-300 text-lg">{currentTrack.artist}</p>
                  </>
                ) : (
                  <div className="w-48 h-48 mx-auto mb-6 bg-gray-700 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">🎵</div>
                      <p>No track selected</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Visualizer */}
              <div className="mb-8">
                <AudioVisualizer />
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-300 min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>
                  <div 
                    className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative group"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full relative"
                      style={{
                        width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                      }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-300 min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <Controls />

              {/* Secondary Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isShuffled 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Shuffle size={18} />
                  </button>
                  <button
                    onClick={toggleRepeat}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      repeatMode !== 'none' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Repeat size={18} />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-1 -right-1 text-xs">1</span>
                    )}
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="w-24 h-2 bg-gray-700 rounded-full cursor-pointer group">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full relative"
                      style={{ width: `${volume * 100}%` }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading and Error States */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-300">Loading...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Playlist */}
          <div className="lg:col-span-1">
            <Playlist />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player