import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayerProvider } from './context/PlayerContext'
import Player from './components/Player'
import Playlist from './components/Playlist'
import AudioVisualizer from './components/AudioVisualizer'
import './styles/global.css'

function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <header className="text-center mb-8">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
              >
                Music Player
              </motion.h1>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                Upload and play your favorite MP3 files with beautiful visualizations
              </motion.p>
            </header>

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/playlist" element={<PlaylistPage />} />
            </Routes>
          </motion.div>
        </div>
      </Router>
    </PlayerProvider>
  )
}

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="space-y-8"
    >
      {/* Audio Visualizer */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <AudioVisualizer />
        </motion.div>
      </div>

      {/* Main Player */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
      >
        <Player />
      </motion.div>

      {/* Quick Playlist Preview */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Your Playlist</h2>
        <Playlist isPreview={true} />
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="grid md:grid-cols-3 gap-6 mt-12"
      >
        <FeatureCard
          title="Upload Music"
          description="Drag and drop or select MP3 files from your device"
          icon="🎵"
          delay={0.1}
        />
        <FeatureCard
          title="Visual Experience"
          description="Watch your music come alive with real-time visualizations"
          icon="🎨"
          delay={0.2}
        />
        <FeatureCard
          title="Local Storage"
          description="Your music library is saved locally on your device"
          icon="💾"
          delay={0.3}
        />
      </motion.div>
    </motion.div>
  )
}

function PlaylistPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Full Playlist</h1>
      <Playlist isPreview={false} />
    </motion.div>
  )
}

function FeatureCard({ title, description, icon, delay }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.4 + delay, duration: 0.6 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  )
}

export default App