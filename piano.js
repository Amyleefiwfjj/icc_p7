let piano;
let notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 to C5

function preload() {
  soundFormats('mp3', 'wav');
  piano = loadSound('./assets/piano_sound.wav'); // Replace with your actual piano sound file
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
}

function draw() {
  if (mouseIsPressed) {
    let noteIndex = floor(map(mouseX, 0, width, 0, notes.length));
    noteIndex = constrain(noteIndex, 0, notes.length - 1);

    let volume = map(mouseY, height, 0, 0, 1);
    volume = constrain(volume, 0, 1);

    let size = map(mouseX, 0, width, 5, 50);
    strokeWeight(size);
    line(pmouseX, pmouseY, mouseX, mouseY);

    playNote(notes[noteIndex], volume);
  }
}

function playNote(note, volume) {
  if (!piano.isPlaying()) {
    piano.setVolume(volume);
    piano.rate(midiToFreq(note) / midiToFreq(60)); // C4 is 60 in MIDI
    piano.play();
  }
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
