let piano;
let notes = [60, 62, 64, 65, 67, 69, 71];
let recording = [];
let isRecording = false;
let recordButton;
let trail = [];
const numOctaves = 3;
const maxTrail = 30;
let soundFile;
let brushcolor = [[240, 158, 158], [237, 183, 145], [237, 231, 145], [191, 245, 159], [158, 240, 202], [156, 230, 225], [163, 208, 240]];

function preload() {
  soundFormats('mp3', 'wav');
  piano = loadSound('./assets/piano_sound.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  recordButton = select('#recordButton');
  prevColor = color(...brushcolor[0]);   targetColor = color(...brushcolor[0]);
  recorder = new p5.SoundRecorder();
  recorder.setInput();
  soundFile = new p5.SoundFile();
}
function draw() {
  if (mouseIsPressed) {
    drawBrush();
    playNoteFromMouse();

    if (isRecording) {
      recorder.record(soundFile);
    }
  }
}

function drawBrush() {
  let dx = mouseX, dy = mouseY;
  let noteIdx = floor(map(mouseX, 0, width, 0, notes.length));
  let octaveIdx = floor(map(mouseY, 0, height, 0, numOctaves));
  let colorIndex = (noteIdx + octaveIdx * notes.length) % brushcolor.length;
  targetColor = color(...brushcolor[colorIndex]);
  prevColor = lerpColor(prevColor, targetColor, 0.05);

  let sw = map(mouseY, 0, height, 5, 50);
  strokeWeight(sw);
  stroke(prevColor);
  line(pmouseX, pmouseY, mouseX, mouseY);
}

function playNoteFromMouse() {
  let noteIndex = floor(map(mouseX, 0, width, 0, notes.length));
  noteIndex = constrain(noteIndex, 0, notes.length - 1);
  let octaveIndex = floor(map(mouseY, 0, height, 0, numOctaves));
  octaveIndex = constrain(octaveIndex, 0, numOctaves - 1);
  let midiToPlay = notes[noteIndex] + octaveIndex * 12;

  let vol = map(mouseY, height, 0, 0, 1);
  vol = constrain(vol, 0, 1);

  // (3) rate 설정을 위해 내장 midiToFreq 호출
  let baseFreq = p5.prototype.midiToFreq.call(this, 60);
  let freq = p5.prototype.midiToFreq.call(this, midiToPlay);

  piano.setVolume(vol);
  piano.rate(freq / baseFreq);
  piano.play();
}

function resetAll() {
  background(255);
}

function toggleRecording() {
  if (!isRecording) {
    recording = [];
    isRecording = true;
    recorder.record(soundFile);
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

function randomMix() {
  isPlayingRandom = true;
  background(255);
  notes = shuffle(notes, true);
}

function getNoteIndexFromMidi(midi) {
  return notes.indexOf(midi);
}

function homePage() {
  window.location.href = "index.html";
}
