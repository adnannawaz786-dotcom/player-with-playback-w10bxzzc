import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerContext } from '../context/PlayerContext';

const Controls = () => {
  const {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    playPause,
    previousTrack,
    nextTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat
  } = usePlayerContext();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return (
        <div className="relative">
          <Repeat size={20} />
          <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
        </div>
      );
    }
    return <Repeat size={20} />;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        {/* Previous Track */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={previousTrack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          disabled={!currentTrack}
        >
          <SkipBack size={20} className="text-white" />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={playPause}
          className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="text-white ml-1" />
          )}
        </motion.button>

        {/* Next Track */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextTrack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          disabled={!currentTrack}
        >
          <SkipForward size={20} className="text-white" />
        </motion.button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Left Side - Shuffle & Repeat */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-all duration-200 ${
              isShuffled 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            }`}
          >
            <Shuffle size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-all duration-200 ${
              repeatMode !== 'off' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            }`}
          >
            {getRepeatIcon()}
          </motion.button>
        </div>

        {/* Right Side - Volume Control */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} className="text-white/70" />
            ) : (
              <Volume2 size={16} className="text-white/70" />
            )}
          </motion.button>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-xs text-white/70 w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Controls;