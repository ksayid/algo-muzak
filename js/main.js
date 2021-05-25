const delayStart = 1
const tempo = 175
const beat = 60 / tempo
const bar = beat * 4
const root = 277.18
let dur;
let lvl;
let t; 
let osc;

const notes = [
    392, //G4
    369.99, //F#4
    440, //A4
    293.66, //D4
    493.88, //B4
    587.33, //D5
    523.25, //C5 
];

// https://www.hooktheory.com/theorytab/view/yuki-hayashi/you-say-run
// not really the full song
const full_song = [392, 369.99, 440, 392, 369.99, 293.66, 369.99, 392, 369.99,
                   440, 369.99, 293.66, 369.99, 392, 440, 493.88, 440, 493.88, 
                   392, 440, 369.99, 293.66, 369.99, 392, 587.33, 523.25, 
                   493.88, 440];
const durations = [1.5, 1, 1.5, 1.5, 1.5, .5, .5, 1.5, 1.5, .5, 2, 1, .5, .5, 
                   .5, 1.5, 1.5, .5, 1.5, .5, 1.5, .5, .5, 2, 1, .5, 1.5, 1];
  
const notes_str = ["G4", "F#4", "A4", "D4", "B4", "D5", "C5"];
  
const notes_obj = {"G4" : 392,
                   "F#4" : 369.99,
                   "A4" : 440,
                   "D4" : 293.66,
                   "B4" : 493.88,
                   "D5" : 587.33,
                   "C5" : 523.25
                  };

function adsr(context, opts){
    const param = opts.param;
    const peak = opts.peak || 1;
    const hold = opts.hold || 0.7;
    const time = opts.time || context.currentTime;
    const dur = opts.duration || 1;
    const a = opts.attack || dur * 0.2;
    const d = opts.decay || dur * 0.1;
    const s = opts.sustain || dur * 0.5;
    const r = opts.release || dur * 0.2;

    const initVal = param.value;
    param.setValueAtTime(initVal, time);
    param.linearRampToValueAtTime(peak, time + a);
    param.linearRampToValueAtTime(hold, time + a + d);
    param.linearRampToValueAtTime(hold, time+ a + d + s);
    param.linearRampToValueAtTime(initVal, time + a + d + s + r);
}

function tone(context, new_fft, type, pitch, time, duration){
    t = time || context.currentTime
    dur = duration || 1
    osc = new OscillatorNode(context, {
      type: type || 'sine',
      frequency: pitch || 440
    })
    lvl = new GainNode(context, {gain: 0.001})
    osc.connect(lvl)
    lvl.connect(context.destination)
    lvl.connect(new_fft)
    osc.start(t)
    osc.stop(t + 4)
    adsr(context, {
      param: lvl.gain,
      time: t,
      duration: dur
    })
}

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// To visualize the markov chain:
// https://setosa.io/markov/index.html#%7B%22tm%22%3A%5B%5B0%2C0.5%2C0.33%2C0%2C0%2C0.17%2C0%5D%2C%5B0.29%2C0%2C0.29%2C0.42%2C0%2C0%2C0%5D%2C%5B0.2%2C0.4%2C0%2C0%2C0.4%2C0%2C0%5D%2C%5B0%2C1%2C0%2C0%2C0%2C0%2C0%5D%2C%5B0.33%2C0%2C0.67%2C0%2C0%2C0%2C0%5D%2C%5B0%2C0%2C0%2C0%2C0%2C0%2C1%5D%2C%5B0%2C0%2C0%2C0%2C1%2C0%2C0%5D%5D%7D    
// The idea of a markov chain is that the value in a sequence only depends on its previous value. 
// Suppose our chain starts with G.  The note G appears 6 times in my riff I'm using above. 
// 4/6 times, the note F# follows right after (1/6 times A and 1/6 D follow).
// So, 67% of the time, after a G, we should draw an F#. I use this logic to produce the function below.
// https://i.imgur.com/KqHlvZp.png
// For more info: https://shiffman.net/a2z/markov/
async function markovSampler(){
    let seenNotes = [notes[getRandomInt(0, notes.length)]];
    let curVal = seenNotes[seenNotes.length - 1];
    for (let i = 0; i < 28; i++){
        let randVal = Math.random();
        if (curVal == 392){
            if (randVal <= 0.5){
                seenNotes.push(369.99);
            } else if (randVal <= 0.67){
                seenNotes.push(587.33);
            } else {
                seenNotes.push(440);
            }
        } else if (curVal == 369.99){
            if (randVal <= 0.29){
                seenNotes.push(392);
            } else if (randVal <= 0.58){
                seenNotes.push(440);
            } else {
                seenNotes.push(293.66);
            }
        } else if (curVal == 440){
            if (randVal <= 0.2){
                seenNotes.push(392);
            } else if (randVal <= 0.60){
                seenNotes.push(369.99);
            } else {
                seenNotes.push(493.88);
            }
        } else if (curVal == 293.66){
              seenNotes.push(369.99);
        } else if (curVal == 493.88){
            if (randVal <= 0.33){
                seenNotes.push(392);
            } else {
                seenNotes.push(440);
            }
        } else if (curVal == 587.33){
            seenNotes.push(523.25);
        } else if (curVal == 523.25){
            seenNotes.push(493.88);
        } else{
            console.log("error", curVal);
        }
          
        curVal = seenNotes[seenNotes.length - 1];
    }
    console.log(seenNotes);
    return seenNotes;
}

function generateRandomSong(ctx, fft){
    for (let i = 0; i < full_song.length; i++){
        let time = i * beat + delayStart;
        let dur = beat;
        let s = Math.floor(Math.random() * notes.length)
        let pitch = full_song[s]
        tone(ctx, fft, 'sine', pitch, time, dur);
    }
}

function generateMarkovSong(ctx, fft, seenNotes){
    console.log(seenNotes);
    for (let i = 0; i < seenNotes.length; i++){
        let time = i * beat + delayStart;
        let dur = beat;
        let s = Math.floor(Math.random() * notes.length);
        let pitch = seenNotes[i]; //notes[s]
        tone(ctx, fft, 'sine', pitch, time, dur);
    }
}

function generateActualSong(ctx, fft){
    for (let i = 0; i < full_song.length; i++){
        let time = i * beat + delayStart;
        let dur = beat;
        let pitch = full_song[i];
        tone(ctx, fft, 'sine', pitch, time, dur);
    }
}

function generateActualSongFull(ctx, fft){
    let curTime = delayStart;
    for (let i = 0; i < full_song.length; i++){
        let dur = beat * durations[i];
        let pitch = full_song[i];
        tone(ctx, fft, 'sine', pitch, curTime, dur);
        curTime +=  dur;
    }
}

window.onload = function(){
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const fft = new AnalyserNode(ctx, { fftSize: 2048 });
    createWaveCanvas({ element: '#foo1', analyser: fft });
    generateRandomSong(ctx, fft);
    
    const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
    const fft2 = new AnalyserNode(ctx2, { fftSize: 2048 });
    createWaveCanvas({ element: '#foo2', analyser: fft2 });
    markovSampler().then((value) => generateMarkovSong(ctx2, fft2, value));
    
    const ctx3 = new (window.AudioContext || window.webkitAudioContext)();
    const fft3 = new AnalyserNode(ctx3, { fftSize: 2048 });
    createWaveCanvas({ element: '#foo3', analyser: fft3 });
    generateActualSong(ctx3, fft3);

    const ctx4 = new (window.AudioContext || window.webkitAudioContext)();
    const fft4 = new AnalyserNode(ctx4, { fftSize: 2048 });
    createWaveCanvas({ element: '#foo4', analyser: fft4 });
    generateActualSongFull(ctx4, fft4);

    document.querySelector('#play').addEventListener('click', function() {
        ctx.resume().then(() => {
            console.log('Playback resumed successfully');
        });
    })

    document.querySelector('#play2').addEventListener('click', function() {
        ctx2.resume().then(() => {
            console.log('Playback resumed successfully');
        });
    })
  
     document.querySelector('#play3').addEventListener('click', function() {
        ctx3.resume().then(() => {
            console.log('Playback resumed successfully');
        });
    })

     document.querySelector('#play4').addEventListener('click', function() {
        ctx4.resume().then(() => {
            console.log('Playback resumed successfully');
        });
    })
}

let fullWidth = window.innerWidth;
let fullHeight = window.innerHeight;
let noteChars = ['♪', '♫'];


for (let i = 0; i < 100; i++){
    let elem = document.createElement("div");
    elem.style.color = 'white';
    elem.textContent = noteChars[getRandomInt(0, noteChars.length)];
    elem.style.position = "absolute";
    elem.style.left = Math.round(Math.random() * fullWidth) + "px";
    elem.style.top = Math.round(Math.random() * fullHeight) + "px";
    document.body.appendChild(elem);
}

