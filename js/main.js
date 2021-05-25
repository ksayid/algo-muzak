// https://www.hooktheory.com/theorytab/view/yuki-hayashi/you-say-run
// https://www.youtube.com/watch?v=4um6Cj4eIv8&list=PLoQrXDiSBWYGQ167CWWvw0AoH-gSVnclm&index=3
// https://setosa.io/markov/index.html#%7B%22tm%22%3A%5B%5B0.5%2C0.5%2C0%5D%2C%5B0.75%2C0.25%2C0%5D%2C%5B1%2C0%2C0%5D%5D%7D
window.onload = function(){
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const fft = new AnalyserNode(ctx, { fftSize: 2048 })
  createWaveCanvas({ element: 'section', analyser: fft })

  function tone(type, pitch, time, duration){
    const t = time || ctx.currentTime
    const dur = duration || 1
    const osc = new OscillatorNode(ctx, {
      type: type || 'sine',
      frequency: pitch || 440
    })

    const lvl = new GainNode(ctx, {gain: 0.001})
    osc.connect(lvl)
    lvl.connect(ctx.destination)
    lvl.connect(fft)
    osc.start(t)
    osc.stop(t + 4)
    adsr({
      param: lvl.gain,
      time: t,
      duration: dur
    })
  }

  function adsr(opts){
    const param = opts.param
    const peak = opts.peak || 1
    const hold = opts.hold || 0.7
    const time = opts.time || ctx.currentTime
    const dur = opts.duration || 1
    const a = opts.attack || dur * 0.2
    const d = opts.decay || dur * 0.1
    const s = opts.sustain || dur * 0.5
    const r = opts.release || dur * 0.2

    const initVal = param.value
    param.setValueAtTime(initVal, time)
    param.linearRampToValueAtTime(peak, time+a)
    param.linearRampToValueAtTime(hold, time+a+d)
    param.linearRampToValueAtTime(hold, time+a+d+s)
    param.linearRampToValueAtTime(initVal, time+a+d+s+r)
  }

  function step(rootFreq, steps){
    let tr2 = Math.pow(2, 1 / 12)
    let rnd = rootFreq * Math.pow(tr2, steps)
    return Math.round(rnd * 100) / 100
  }

  const notes = [
    392, //G4
    369.99, //F#4
    440, //A4
    293.66, //D4
    493.88, //B4
    587.33, //D5
    523.25, //C5
  ]

const full_song = [392, 369.99, 400,
392, 369.99, 293.66, 369.99, 392, 369.99,
440, 369.99, 293.66, 369.99, 392, 440,
493.88, 440, 493.88, 392, 440, 369.99, 293.66,
369.99, 392, 587.33, 523.25, 493.88, 440]
  
  const notes_str = ["G4", "F#4", "A4", "D4", "B4", "D5", "C5"];
  
  
  
  const notes_obj = {"G4" : 392,
                 "F#4" : 369.99,
                 "A4" : 440,
                 "D4" : 293.66,
                 "B4" : 493.88,
                 "D5" : 587.33,
                 "C5" : 523.25}


  const delayStart = 1
  const tempo = 120
  const beat = 60 / tempo
  const bar = beat * 4
  const root = 277.18
  const scale = notes

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
  let seenNotes = [notes[getRandomInt(0, notes.length)]]

  function markovSampler(){
      let curVal = seenNotes[seenNotes.length - 1]
      for (let i = 0; i < 28; i++){
          let randVal = Math.random()
          if (curVal == 392){
              if (randVal <= 0.5){
                  seenNotes.push(369.99)
              } else if (randVal <= 0.67){
                  seenNotes.push(587.33)
              } else {
                  seenNotes.push(440)
              }
          } else if (curVal == 399.99){
              if (randVal <= 0.29){
                  seenNotes.push(392)
              } else if (randVal <= 0.58){
                  seenNotes.push(440)
              } else {
                  seenNotes.push(293.66)
              }
          } else if (curVal == 440){
              if (randVal <= 0.2){
                  seenNotes.push(392)
              } else if (randVal <= 0.60){
                  seenNotes.push(399.99)
              } else {
                  seenNotes.push(493.88)
              }
          } else if (curVal == 293.66){
              seenNotes.push(369.99)
          } else if (curVal == 493.88){
              if (randVal <= 0.33){
                  seenNotes.push(392)
              } else {
                  seenNotes.push(440)
              }
          } else if (curVal == 587.33){
              seenNotes.push(523.25)
          } else if (curVal == 523.25){
              seenNotes.push(493.88)
          }
        curVal = seenNotes[seenNotes.length - 1];
    }
    console.log(seenNotes)
  }
  
  markovSampler()
  for (let i = 0; i < seenNotes.length; i++){
    const time = i * beat + delayStart
    const dur = beat
    const s = Math.floor(Math.random() * notes.length)
    const pitch = seenNotes[i] //notes[s]
    tone('sine', pitch, time, dur)
  }

  document.querySelector('#play').addEventListener('click', function() {
    ctx.resume().then(() => {
      console.log('Playback resumed successfully')
    })
  })

    const ctx2 = new (window.AudioContext || window.webkitAudioContext)()
    const fft2 = new AnalyserNode(ctx2, { fftSize: 2048 })
    createWaveCanvas({ element: 'div', analyser: fft2 })

  function tone2(type, pitch, time, duration){
    const t = time || ctx2.currentTime
    const dur = duration || 1
    const osc = new OscillatorNode(ctx2, {
      type: type || 'sine',
      frequency: pitch || 440
    })

    const lvl = new GainNode(ctx2, {gain: 0.001})
    osc.connect(lvl)
    lvl.connect(ctx2.destination)
    lvl.connect(fft2)
    osc.start(t)
    osc.stop(t + 4)
    adsr({
      param: lvl.gain,
      time: t,
      duration: dur
    })
  }

  for (let i = 0; i < 28; i++){
    const time = i * beat + delayStart
    const dur = beat
    //const s = Math.floor(Math.random() * notes.length)
    //const pitch = notes[s]
    const pitch = full_song[i]
    tone2('sine', pitch, time, dur)
  }



  document.querySelector('#play2').addEventListener('click', function() {
    ctx2.resume().then(() => {
      console.log('Playback resumed successfully')
    })
  })

}

