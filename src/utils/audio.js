// Audio processing and visualization utilities
export const createAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return new AudioContextClass();
};

// Audio file validation
export const validateAudioFile = (file) => {
  const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload MP3, WAV, OGG, or M4A files.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 50MB.');
  }

  return true;
};

// Create audio URL from file
export const createAudioUrl = (file) => {
  return URL.createObjectURL(file);
};

// Clean up audio URL
export const revokeAudioUrl = (url) => {
  URL.revokeObjectURL(url);
};

// Format time duration
export const formatTime = (seconds) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Get audio metadata
export const getAudioMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = createAudioUrl(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata = {
        duration: audio.duration,
        name: file.name.replace(/\.[^/.]+$/, ''),
        size: file.size,
        type: file.type
      };
      revokeAudioUrl(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      revokeAudioUrl(url);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = url;
  });
};

// Audio visualization utilities
export const createVisualizationData = (analyser, dataArray) => {
  analyser.getByteFrequencyData(dataArray);
  
  // Create bars for visualization
  const bars = [];
  const barCount = 64;
  const dataStep = Math.floor(dataArray.length / barCount);
  
  for (let i = 0; i < barCount; i++) {
    const dataIndex = i * dataStep;
    const value = dataArray[dataIndex] || 0;
    bars.push(value / 255); // Normalize to 0-1
  }
  
  return bars;
};

// Setup audio analyser
export const setupAudioAnalyser = (audioContext, audioElement) => {
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audioElement);
  
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  return { analyser, dataArray };
};

// Draw waveform visualization
export const drawWaveform = (canvas, bars, color = '#3b82f6') => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  
  ctx.clearRect(0, 0, width, height);
  
  const barWidth = width / bars.length;
  const centerY = height / 2;
  
  bars.forEach((bar, index) => {
    const barHeight = bar * height * 0.8;
    const x = index * barWidth;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '40');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
  });
};

// Draw circular visualizer
export const drawCircularVisualizer = (canvas, bars, color = '#3b82f6') => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;
  
  ctx.clearRect(0, 0, width, height);
  
  const angleStep = (Math.PI * 2) / bars.length;
  
  bars.forEach((bar, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const barHeight = bar * radius * 0.8;
    
    const startX = centerX + Math.cos(angle) * radius;
    const startY = centerY + Math.sin(angle) * radius;
    const endX = centerX + Math.cos(angle) * (radius + barHeight);
    const endY = centerY + Math.sin(angle) * (radius + barHeight);
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
};

// Audio effects
export const createGainNode = (audioContext, initialGain = 1) => {
  const gainNode = audioContext.createGain();
  gainNode.gain.value = initialGain;
  return gainNode;
};

// Crossfade between tracks
export const crossfade = (currentGain, nextGain, duration = 1000) => {
  const steps = 20;
  const stepDuration = duration / steps;
  let step = 0;
  
  const interval = setInterval(() => {
    const progress = step / steps;
    currentGain.gain.value = 1 - progress;
    nextGain.gain.value = progress;
    
    step++;
    if (step > steps) {
      clearInterval(interval);
    }
  }, stepDuration);
};

// Generate audio buffer from frequency data
export const generateTone = (audioContext, frequency, duration, type = 'sine') => {
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    const time = i / sampleRate;
    switch (type) {
      case 'sine':
        data[i] = Math.sin(2 * Math.PI * frequency * time);
        break;
      case 'square':
        data[i] = Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
        break;
      case 'sawtooth':
        data[i] = 2 * (time * frequency - Math.floor(time * frequency + 0.5));
        break;
      default:
        data[i] = Math.sin(2 * Math.PI * frequency * time);
    }
    data[i] *= 0.1; // Reduce volume
  }
  
  return buffer;
};

// Calculate audio peaks for waveform display
export const calculateAudioPeaks = (audioBuffer, samples = 1000) => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const peaks = [];
  
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    let max = 0;
    
    for (let j = start; j < end; j++) {
      max = Math.max(max, Math.abs(channelData[j]));
    }
    
    peaks.push(max);
  }
  
  return peaks;
};

// Detect audio tempo (basic BPM detection)
export const detectTempo = (audioBuffer) => {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
  const peaks = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let energy = 0;
    for (let j = i; j < i + windowSize; j++) {
      energy += channelData[j] * channelData[j];
    }
    peaks.push(energy);
  }
  
  // Simple peak detection for BPM estimation
  const threshold = peaks.reduce((a, b) => a + b) / peaks.length * 1.5;
  const beatTimes = [];
  
  for (let i = 1; i < peaks.length - 1; i++) {
    if (peaks[i] > threshold && peaks[i] > peaks[i - 1] && peaks[i] > peaks[i + 1]) {
      beatTimes.push(i * 0.1); // Convert to seconds
    }
  }
  
  if (beatTimes.length < 2) return 120; // Default BPM
  
  const intervals = [];
  for (let i = 1; i < beatTimes.length; i++) {
    intervals.push(beatTimes[i] - beatTimes[i - 1]);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
  return Math.round(60 / avgInterval);
};