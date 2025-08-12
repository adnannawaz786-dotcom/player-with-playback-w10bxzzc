import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useLocalStorage('audioPlaylist', []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [playbackRate, setPlaybackRate] = useState(1);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = (e) => {
      setError('Failed to load audio file');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update audio properties when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  const loadTrack = useCallback(async (track) => {
    if (!track || !audioRef.current) return;

    setIsLoading(true);
    setError(null);
    
    try {
      audioRef.current.src = track.url;
      setCurrentTrack(track);
      await audioRef.current.load();
    } catch (err) {
      setError('Failed to load track');
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    const clampedRate = Math.max(0.25, Math.min(2, rate));
    setPlaybackRate(clampedRate);
  }, []);

  const addToPlaylist = useCallback((tracks) => {
    const tracksArray = Array.isArray(tracks) ? tracks : [tracks];
    const newTracks = tracksArray.map(track => ({
      id: track.id || Date.now() + Math.random(),
      name: track.name,
      artist: track.artist || 'Unknown Artist',
      url: track.url,
      duration: track.duration || 0,
      addedAt: Date.now()
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
  }, [setPlaylist]);

  const removeFromPlaylist = useCallback((trackId) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(track => track.id !== trackId);
      const removedIndex = prev.findIndex(track => track.id === trackId);
      
      // Adjust current track index if necessary
      if (removedIndex <= currentTrackIndex && currentTrackIndex > 0) {
        setCurrentTrackIndex(prev => prev - 1);
      }
      
      return newPlaylist;
    });
  }, [setPlaylist, currentTrackIndex]);

  const playTrack = useCallback(async (track, index = null) => {
    if (index !== null) {
      setCurrentTrackIndex(index);
    }
    await loadTrack(track);
    await play();
  }, [loadTrack, play]);

  const playTrackByIndex = useCallback(async (index) => {
    if (playlist[index]) {
      setCurrentTrackIndex(index);
      await playTrack(playlist[index]);
    }
  }, [playlist, playTrack]);

  const nextTrack = useCallback(async () => {
    if (playlist.length === 0) return;

    let nextIndex;
    
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }

    await playTrackByIndex(nextIndex);
  }, [playlist, currentTrackIndex, isShuffled, playTrackByIndex]);

  const previousTrack = useCallback(async () => {
    if (playlist.length === 0) return;

    let prevIndex;
    
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    }

    await playTrackByIndex(prevIndex);
  }, [playlist, currentTrackIndex, isShuffled, playTrackByIndex]);

  const handleTrackEnd = useCallback(async () => {
    setIsPlaying(false);

    switch (repeatMode) {
      case 'one':
        await play();
        break;
      case 'all':
        await nextTrack();
        break;
      default:
        if (currentTrackIndex < playlist.length - 1) {
          await nextTrack();
        }
        break;
    }
  }, [repeatMode, currentTrackIndex, playlist.length, play, nextTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'none':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'none';
        default:
          return 'none';
      }
    });
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentTrackIndex(0);
    setCurrentTrack(null);
    pause();
  }, [setPlaylist, pause]);

  const reorderPlaylist = useCallback((startIndex, endIndex) => {
    setPlaylist(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Update current track index if necessary
      if (startIndex === currentTrackIndex) {
        setCurrentTrackIndex(endIndex);
      } else if (startIndex < currentTrackIndex && endIndex >= currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
      } else if (startIndex > currentTrackIndex && endIndex <= currentTrackIndex) {
        setCurrentTrackIndex(prev => prev + 1);
      }

      return result;
    });
  }, [setPlaylist, currentTrackIndex]);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    playlist,
    currentTrackIndex,
    isLoading,
    error,
    isShuffled,
    repeatMode,
    playbackRate,
    
    // Actions
    play,
    pause,
    togglePlay,
    seek,
    changeVolume,
    changePlaybackRate,
    addToPlaylist,
    removeFromPlaylist,
    playTrack,
    playTrackByIndex,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    clearPlaylist,
    reorderPlaylist,
    
    // Utilities
    formatTime,
    
    // Audio element ref
    audioRef
  };
};