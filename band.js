let instruments = ['bass', 'electric', 'drums', 'guitar', 'keyboard'];
let instrumentSounds = {};
let recording = [];
let isRecording = false;
let recordButton;
let soundFile;
let brushcolor = [
  [240, 158, 158], [237, 183, 145], [237, 231, 145], [191, 245, 159],
  [158, 240, 202], [156, 230, 225], [163, 208, 240], [184, 163, 240]
];

let brushLayer;
let hudWidth = 160;

function preload() {
  soundFormats('mp3', 'wav');
  instrumentSounds['bass'] = loadSound('./assets/bass.wav');
  instrumentSounds['electric'] = loadSound('./assets/electric.mp3');
  instrumentSounds['guitar'] = loadSound('./assets/guitar.wav');
  instrumentSounds['keyboard'] = loadSound('./assets/piano_sound.wav');
  instrumentSounds['drum_kick'] = loadSound('./assets/drum_kick.wav');
  instrumentSounds['drum_snare'] = loadSound('./assets/drum_snare.wav');
  instrumentSounds['drum_hat'] = loadSound('./assets/drum_hat.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  brushLayer = createGraphics(windowWidth - hudWidth, windowHeight);
  recordButton = select('#recordButton');
  background(255);
  recorder = new p5.SoundRecorder();
  recorder.setInput();
  soundFile = new p5.SoundFile();
}

function draw() {
  background(255);
  image(brushLayer, hudWidth, 0);
  drawInstrumentGuide();

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

    if (instrument === 'drums') {
      let drumType;
      if (relativeX < (width - hudWidth) / 3) drumType = 'drum_kick';
      else if (relativeX < 2 * (width - hudWidth) / 3) drumType = 'drum_snare';
      else drumType = 'drum_hat';

      playDrum(drumType, volume);
      if (isRecording) {
        recording.push({ instrument: drumType, volume, x: mouseX, y: mouseY, time: millis() });
      }
    } else {
      let relativeY = mouseY % sectionHeight;
      let pitch = map(relativeY, sectionHeight, 0, 0.5, 2.0);
      playInstrument(instrument, pitch, volume);
      if (isRecording) {
        recording.push({ instrument, pitch, volume, x: mouseX, y: mouseY, time: millis() });
      }
    }
  }
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
  if (sound && !sound.isPlaying()) {
    sound.setVolume(volume);
    sound.play();
  }
}

function playInstrument(instrument, pitch, volume) {
  let sound = instrumentSounds[instrument];
  if (sound && !sound.isPlaying()) {
    sound.rate(pitch);
    sound.setVolume(volume);
    sound.play();
  }
}
function homePage() {
  window.location.href = "index.html";
}
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
