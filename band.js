let instruments = ['bass', 'electric', 'drums', 'guitar', 'keyboard'];
let instrumentSounds = {};
let recording = [];
let isRecording = false;
let recordButton;
let soundFile;
let recorder;
let brushcolor = [
  [240, 158, 158], [237, 183, 145], [237, 231, 145], [191, 245, 159],
  [158, 240, 202], [156, 230, 225], [163, 208, 240], [184, 163, 240]
];
let lastPlayTime = 0;
const PLAY_INTERVAL = 100; // 0.1초마다 한 번만 재생

let brushLayer;
let hudWidth = 160;
let trail = []; // 브러쉬 궤적 저장

function preload() {
  soundFormats('mp3', 'wav');
  instrumentSounds['bass'] = loadSound('./assets/bass.wav');
  instrumentSounds['electric'] = loadSound('./assets/electric.wav');
  instrumentSounds['guitar'] = loadSound('./assets/guitar.wav');
  instrumentSounds['keyboard'] = loadSound('./assets/piano_sound.wav');
  instrumentSounds['drum_kick'] = loadSound('./assets/drum_kick.wav');
  instrumentSounds['drum_snare'] = loadSound('./assets/drum_snare.wav');
  instrumentSounds['drum_hat'] = loadSound('./assets/drum_hat.wav');
}
// setup() 맨 위에 추가
delete window.midiToFreq;

function setup() {
  const headerH = 60;                                 // 헤더 높이
  const cnv = createCanvas(windowWidth, windowHeight - headerH);
  cnv.parent('canvasContainer');

  // HUD 너비를 뺀 영역만큼 brushLayer 생성
  brushLayer = createGraphics(windowWidth - hudWidth, windowHeight - headerH);

  // 이제 더 이상 전체 높이로 덮어쓰지 않습니다!
  recordButton = select('#recordButton');
  background(255);

  // Recorder 설정
  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();
}

function draw() {
  background(255);
  image(brushLayer, hudWidth, 0);
  drawInstrumentGuide();
  playTrailNotes(); // 브러쉬 궤적의 음을 재생

  if (mouseIsPressed && mouseX > hudWidth) {
    let sectionHeight = height / instruments.length;
    let instrumentIndex = floor(mouseY / sectionHeight);
    instrumentIndex = constrain(instrumentIndex, 0, instruments.length - 1);
    let instrument = instruments[instrumentIndex];

    let relativeX = mouseX - hudWidth;
    let volume = map(relativeX, 0, width - hudWidth, 0.2, 1.0);
    let size = map(relativeX, 0, width - hudWidth, 5, 50);
    let noteIndex = floor(map(relativeX, 0, width - hudWidth, 0, brushcolor.length));
    noteIndex = constrain(noteIndex, 0, brushcolor.length - 1);
    let colorVal = color(...brushcolor[noteIndex]);

    brushLayer.strokeWeight(size);
    brushLayer.stroke(colorVal);
    brushLayer.line(pmouseX - hudWidth, pmouseY, mouseX - hudWidth, mouseY);

    trail.push({ x: mouseX, y: mouseY, instrument, volume, noteIndex });

    if (isRecording) {
      recording.push({ instrument, volume, x: mouseX, y: mouseY, time: millis() });
    }
  }
}

function playTrailNotes() {
  if (trail.length > 0) {
    const SAMPLE_RATE = 5;   // 5개당 1번만 재생

    // trail[0], trail[5], trail[10], ... 만 처리
    for (let i = 0; i < trail.length; i += SAMPLE_RATE) {
      let t = trail[i];
      let instrument = t.instrument;
      let volume = t.volume;

      if (instrument === 'drums') {
        let drumType = getDrumType(t.x - hudWidth);
        playDrum(drumType, volume);
      } else {
        let pitch = map(t.y, 0, height, 0.5, 2.0);
        playInstrument(instrument, pitch, volume);
      }
    }

    // 사용한 후에는 비워 줍니다
    trail = [];
  }
}

function getDrumType(relativeX) {
  if (relativeX < (width - hudWidth) / 3) return 'drum_kick';
  else if (relativeX < 2 * (width - hudWidth) / 3) return 'drum_snare';
  else return 'drum_hat';
}

function drawInstrumentGuide() {
  let sectionHeight = height / instruments.length;
  textAlign(LEFT, CENTER);
  textSize(18);
  for (let i = 0; i < instruments.length; i++) {
    let y = sectionHeight * i;
    fill(30);
    noStroke();
    rect(0, y, hudWidth, sectionHeight);
    fill(255);
    text(`🎵 ${instruments[i].toUpperCase()}`, 10, y + sectionHeight / 2);
    stroke(100);
    strokeWeight(1);
    line(0, y, width, y);
  }
}

function playDrum(drumType, volume) {
  let sound = instrumentSounds[drumType];
  if (sound) {
    sound.setVolume(volume);
    sound.play();
  }
}

function playInstrument(instrument, pitch, volume) {
  let sound = instrumentSounds[instrument];
  if (sound) {
    sound.rate(pitch);
    sound.setVolume(volume);
    sound.play();
  }
}

function toggleRecording() {
  if (!isRecording) {
    recording = [];
    isRecording = true;
    soundFile = new p5.SoundFile();
    console.log("Recording started...");
  } else {
    isRecording = false;
    recorder.stop();
    console.log("Recording stopped.");
    saveRecording();
  }
}

function saveRecording() {
  if (soundFile) {
    save(soundFile, 'your_recording.mp3');
  } else {
    console.error("No recording found. Make sure you have recorded something.");
  }
}

function resetAll() {
  background(255);
}
function homePage() {
  window.location.href = "index.html";
}
