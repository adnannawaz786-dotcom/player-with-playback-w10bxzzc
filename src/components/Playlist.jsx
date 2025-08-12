import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Music, Upload, X } from 'lucide-react';
import { usePlayerContext } from '../context/PlayerContext';

const Playlist = () => {
  const {
    playlist,
    currentTrack,
    isPlaying,
    addToPlaylist,
    removeFromPlaylist,
    playTrack,
    togglePlayPause
  } = usePlayerContext();

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const track = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Unknown Artist',
          duration: 0,
          url: url,
          file: file
        };
        addToPlaylist(track);
      }
    });
    event.target.value = '';
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-6 h-6" />
          Playlist
        </h2>
        
        <label className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105">
          <Upload className="w-4 h-4" />
          Upload
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {playlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Music className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <p className="text-white/60 text-lg mb-2">No tracks in playlist</p>
          <p className="text-white/40 text-sm">Upload some audio files to get started</p>
        </motion.div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence>
            {playlist.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  currentTrack?.id === track.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <div className="flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      currentTrack?.id === track.id && isPlaying
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                    }`}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </motion.button>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    currentTrack?.id === track.id ? 'text-white' : 'text-white/90'
                  }`}>
                    {track.name}
                  </h3>
                  <p className="text-sm text-white/60 truncate">
                    {track.artist}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60 font-mono">
                    {formatTime(track.duration)}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromPlaylist(track.id);
                    }}
                    className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {playlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-white/10"
        >
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>{playlist.length} track{playlist.length !== 1 ? 's' : ''}</span>
            <span>
              Total: {formatTime(playlist.reduce((total, track) => total + (track.duration || 0), 0))}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Playlist;