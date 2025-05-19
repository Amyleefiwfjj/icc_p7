let instruments = ['bass', 'electric', 'drums', 'guitar', 'keyboard'];
let instrumentSounds = {};
let recording = [];
let isRecording = false;
let isPlayingRandom = false;
let recordButton;
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
}

function draw() {
  background(255);
  image(brushLayer, hudWidth, 0);
  drawInstrumentGuide();

  if (mouseIsPressed && !isPlayingRandom && mouseX > hudWidth) {
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

function toggleRecording() {
  if (!isRecording) {
    recording = [];
    isRecording = true;
    recordButton.html("Stop Recording");
    console.log("🎙️ Recording started...");
  } else {
    isRecording = false;
    recordButton.html("Start Recording");
    console.log("✅ Recording stopped. Stored notes:", recording);
  }
}

function randomMix() {
  isPlayingRandom = true;
  brushLayer.clear();
  if (recording.length > 0) {
    let shuffled = shuffle([...recording]);
    for (let i = 0; i < shuffled.length; i++) {
      setTimeout(() => {
        let r = shuffled[i];
        if (r.instrument.startsWith('drum')) {
          playDrum(r.instrument, r.volume);
        } else {
          playInstrument(r.instrument, r.pitch, r.volume);
        }
        brushLayer.stroke(color(...brushcolor[floor(random(brushcolor.length))]));
        brushLayer.strokeWeight(10);
        brushLayer.point(r.x - hudWidth, r.y);
        if (i === shuffled.length - 1) isPlayingRandom = false;
      }, i * 150);
    }
  } else {
    isPlayingRandom = false;
  }
}
