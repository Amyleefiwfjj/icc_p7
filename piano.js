let piano;
let notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 to C5
let recording = [];
let isRecording = false;
let recordButton;
let trail = []; // 브러쉬 트레일 저장용
const maxTrail = 30;
let soundFile;
let brushcolor = [[240, 158, 158], [237, 183, 145], [237, 231, 145], [191, 245, 159], [158, 240, 202], [156, 230, 225], [163, 208, 240], [184, 163, 240]];

function preload() {
  soundFormats('mp3', 'wav');
  piano = loadSound('./assets/piano_sound.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  recordButton = select('#recordButton');
  prevColor = color(...brushcolor[0]);  // 초기 색상
  targetColor = color(...brushcolor[0]);
  recorder = new p5.SoundRecorder();
  recorder.setInput();
  soundFile = new p5.SoundFile();
}

function draw() {
  if (mouseIsPressed) {
    let noteIndex = floor(map(mouseX, 0, width, 0, notes.length));
    noteIndex = constrain(noteIndex, 0, notes.length - 1);

    let volume = map(mouseY, height, 0, 0, 1);
    volume = constrain(volume, 0, 1);

    let size = map(mouseY, 0, width, 5, 50);
    strokeWeight(size);

    targetColor = color(...brushcolor[noteIndex]);
    prevColor = lerpColor(prevColor, targetColor, 0.05);

    stroke(prevColor);
    line(pmouseX, pmouseY, mouseX, mouseY);

    // 🎵 궤적 저장 (여러 음)
    trail.push({ note: notes[noteIndex], volume: volume, x: mouseX, y: mouseY });

    if (isRecording) {
      recording.push({ note: notes[noteIndex], volume: volume, x: mouseX, y: mouseY, time: millis() });
    }

    prevNoteIndex = noteIndex;
  }

  // 🎵 궤적의 음을 동시에 재생
  playTrailNotes();
}

// ✅ 궤적을 따라 음을 동시에 재생
function playTrailNotes() {
  if (trail.length > 0) {
    for (let i = 0; i < trail.length; i++) {
      let t = trail[i];
      playNote(t.note, t.volume); // 여러 음 동시에 재생
    }
    trail = []; // 재생 후 초기화
  }
}
function playNote(note, volume) {
  let newSound = loadSound('./assets/piano_sound.wav', (sound) => {
    sound.setVolume(volume);
    sound.rate(midiToFreq(note) / midiToFreq(60)); // C4 기준
    sound.play();
  });
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ✅ 녹음 시작/중지 기능
function toggleRecording() {
  if (!isRecording) {
    recording = [];
    isRecording = true;
    recorder.record(soundFile); // 🔴 녹음 시작
    console.log("Recording started...");
  } else {
    isRecording = false;
    recorder.stop(); // ⏹️ 녹음 중지
    console.log("Recording stopped.");
    saveRecording(); // 저장 호출
  }
}

// ✅ MP3 파일로 저장하기
function saveRecording() {
  if (soundFile) {
    save(soundFile, 'your_recording.mp3');
  } else {
    console.error("No recording found. Make sure you have recorded something.");
  }
}

// ✅ 랜덤 믹스 (모든 음을 무작위로)
function randomMix() {
  isPlayingRandom = true;
  background(255);

  if (recording.length > 0) {
    let shuffled = shuffle([...recording]);  // 순서만 섞기

    for (let i = 0; i < shuffled.length; i++) {
      setTimeout(() => {
        let r = shuffled[i];
        playNote(r.note, r.volume);

        // 시각화
        stroke(color(...brushcolor[getNoteIndexFromMidi(r.note)]));
        strokeWeight(10);
        point(r.x, r.y);  // 해당 위치에 점을 찍음

        if (i === shuffled.length - 1) {
          isPlayingRandom = false;
        }
      }, i * 100); // 🎵 빠르게 재생 (100ms 간격)
    }
  } else {
    isPlayingRandom = false;
  }
}

// ✅ 녹음된 음의 MIDI 인덱스 찾기
function getNoteIndexFromMidi(midi) {
  return notes.indexOf(midi);
}

function homePage() {
  window.location.href = "index.html";
}
