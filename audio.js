let audioCtx = new AudioContext();
let sampleRate = audioCtx.sampleRate;
let oscBuffer, currentBuffer, currentGainNode;
let compressor = audioCtx.createDynamicsCompressor();

compressor.threshold.value = -6;
compressor.knee.value = 40;
compressor.ratio.value = 20;
compressor.attack.value = 0;
compressor.release.value = 0.25;
compressor.connect(audioCtx.destination);


function setupSound(polygonOsc, rounding) {
    noteOff();
    let wave = polygonOsc.get(440, 1, rounding, sampleRate).wave;
    let max = Math.max.apply(null, wave);
    if(max>1){
        for(let i=0,l=wave.length;i<l;i++)wave[i] /= max;
    }
    oscBuffer = createBuffer(wave, sampleRate);
    noteOn();
}
function createBuffer(arr, sampleRate) {
    let channels = 1, length = arr.length;
    let buffer = audioCtx.createBuffer(channels, length, sampleRate);
    let channelDataL = buffer.getChannelData(0);
    for (let i = 0; i < length; i++)channelDataL[i] = arr[i];
    return buffer;
}

function keyboardHandler() {
    let n = Math.floor(mouseX / keyboardEl.offsetWidth * keys);
    let hz = scale[n];
    noteOff();
    noteOn(hz / 880);
}
function keydownHandler(e){
    let n = "zxcvbnmasdfghjk".indexOf(e.key);
    if(n==-1)return;

    let hz = scale[n];
    noteOff();
    noteOn(hz / 880);
}
function noteOn(speed = 1) {
    let buffer = currentBuffer = audioCtx.createBufferSource();
    buffer.buffer = oscBuffer;
    buffer.playbackRate.value = speed;
    buffer.loop = true;

    let gainNode = currentGainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime + 0.05, 1 / 10);
    gainNode.gain.setTargetAtTime(0.3, audioCtx.currentTime  + 0.2, 1 / 10);
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 2, 1 / 4);
    buffer.connect(gainNode);
    gainNode.connect(compressor);
    buffer.start(audioCtx.currentTime);
    buffer.stop(audioCtx.currentTime + 3);
}
function noteOff() {
    if (!currentBuffer) return;
    currentGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    currentGainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.05, 1 / 10);
    currentBuffer.stop(audioCtx.currentTime + 0.5);
}