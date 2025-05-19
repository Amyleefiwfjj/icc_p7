let piano;
let notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 to C5
let recording = [];
let isRecording = false;
let recordButton;
let trail = []; // 브러쉬 트레일 저장용
const maxTrail = 30;
let brushcolor=[[240, 158, 158],[237, 183, 145],[237, 231, 145],[191, 245, 159],[158, 240, 202],[156, 230, 225],[163, 208, 240],[184, 163, 240]];
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
}

function draw() {
  if (mouseIsPressed) {
    let noteIndex = floor(map(mouseX, 0, width, 0, notes.length));
    noteIndex = constrain(noteIndex, 0, notes.length - 1);

    let volume = map(mouseY, height, 0, 0, 1);
    volume = constrain(volume, 0, 1);

    let size = map(mouseX, 0, width, 5, 50);
    strokeWeight(size);

    // 현재 목표 색상 설정
    targetColor = color(...brushcolor[noteIndex]);

    // 매 프레임마다 부드럽게 색 전환
    prevColor = lerpColor(prevColor, targetColor, 0.05);

    stroke(prevColor);
    line(pmouseX, pmouseY, mouseX, mouseY);

    playNote(notes[noteIndex], volume);

    if (isRecording) {
      recording.push({ note: notes[noteIndex], volume: volume, time: millis() });
    }
    
    prevNoteIndex = noteIndex;
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

function toggleRecording() {
  if (!isRecording) {
    recording = [];
    isRecording = true;
    console.log("Recording started...");
  } else {
    isRecording = false;
    recordButton.html("Start Recording");
    console.log("Recording stopped. Stored notes:", recording);
  }
}

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
        }, i * 150);
        }
    } else {
        isPlayingRandom = false;
    }

}