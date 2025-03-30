// 사운드 효과를 위한 AudioContext 생성
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// 더 차분한 테트리스 배경 음악
const tetrisTheme = {
  notes: [
    { note: 'E4', duration: 0.5 }, { note: 'B3', duration: 0.25 },
    { note: 'C4', duration: 0.5 }, { note: 'A3', duration: 0.25 },
    { note: 'A3', duration: 0.5 }, { note: 'C4', duration: 0.25 },
    { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.25 },
    { note: 'B3', duration: 0.75 },
    { note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
    { note: 'A3', duration: 0.75 }, { note: 'rest', duration: 0.25 }
  ],
  tempo: 70  // 더 느린 템포
};

// 음계 주파수 매핑 (한 옥타브 낮춤)
const noteFrequencies: { [key: string]: number } = {
  'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63
};

let bgMusicLoop: number | null = null;

// 배경 음악 재생
function playBackgroundMusic() {
  if (bgMusicLoop) return;

  let currentTime = audioContext.currentTime;
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.15; // 볼륨 더 낮게 조정

  function playNote(noteInfo: { note: string; duration: number }, time: number) {
    if (noteInfo.note === 'rest') return;

    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = noteFrequencies[noteInfo.note];
    
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.3, time + 0.1);
    noteGain.gain.linearRampToValueAtTime(0, time + noteInfo.duration - 0.1);
    
    oscillator.start(time);
    oscillator.stop(time + noteInfo.duration);
  }

  function playTheme() {
    tetrisTheme.notes.forEach((noteInfo, index) => {
      playNote(noteInfo, currentTime);
      currentTime += noteInfo.duration * (60 / tetrisTheme.tempo);
    });
    
    bgMusicLoop = window.setTimeout(playTheme, 
      (currentTime - audioContext.currentTime) * 1000);
  }

  playTheme();
}

// 배경 음악 정지
function stopBackgroundMusic() {
  if (bgMusicLoop) {
    clearTimeout(bgMusicLoop);
    bgMusicLoop = null;
  }
}

// 물방울 터지는 효과음 생성
function createBubblePopSound(time: number) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, time);
  oscillator.frequency.exponentialRampToValueAtTime(220, time + 0.15);
  
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.2, time + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
  
  oscillator.start(time);
  oscillator.stop(time + 0.15);
}

// 테트리스 스타일의 사운드 생성 함수
function createTetrisSound(type: 'move' | 'rotate' | 'drop' | 'clear' | 'gameOver') {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'move':
      oscillator.type = 'sine';
      oscillator.frequency.value = 587.33; // D5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case 'rotate':
      oscillator.type = 'sine';
      oscillator.frequency.value = 783.99; // G5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.12);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      break;

    case 'drop':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.linearRampToValueAtTime(261.63, now + 0.15); // C4
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;

    case 'clear':
      // 물방울이 연속으로 터지는 효과
      for (let i = 0; i < 3; i++) {
        createBubblePopSound(now + (i * 0.08));
      }
      break;

    case 'gameOver':
      oscillator.type = 'sine';
      const startFreq = 523.25; // C5
      const duration = 1.0;
      const steps = 6;
      
      for (let i = 0; i < steps; i++) {
        const time = now + (i * duration / steps);
        oscillator.frequency.setValueAtTime(startFreq / Math.pow(1.5, i/2), time);
        gainNode.gain.setValueAtTime(0.2, time);
        gainNode.gain.linearRampToValueAtTime(0, time + duration / steps - 0.05);
      }
      
      oscillator.start(now);
      oscillator.stop(now + duration);
      break;
  }
}

export const sounds = {
  move: () => createTetrisSound('move'),
  rotate: () => createTetrisSound('rotate'),
  drop: () => createTetrisSound('drop'),
  clear: () => createTetrisSound('clear'),
  gameOver: () => createTetrisSound('gameOver'),
  startMusic: () => playBackgroundMusic(),
  stopMusic: () => stopBackgroundMusic()
}; 