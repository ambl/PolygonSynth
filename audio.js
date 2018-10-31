let audioCtx = new AudioContext();
let compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.value = -6; //log(comp)// <-最大値、最小値が出る
compressor.knee.value = 40;
compressor.ratio.value = 20;
compressor.attack.value = 0;
compressor.release.value = 0.25; 
compressor.connect(audioCtx.destination);

let sampleRate = audioCtx.sampleRate;
let oscBuffer, currentBuffer, currentGainNode;
function setupSound(polygonOsc,rounding){
    cancelSound();
    let wave = polygonOsc.get(440,1,rounding,sampleRate).wave;
    oscBuffer = createBuffer(wave,sampleRate);
    noteOn();
}
function createBuffer(arr,sampleRate){
    let channels = 1, length = arr.length;
    let buffer = audioCtx.createBuffer(channels, length, sampleRate);
    let channelDataL = buffer.getChannelData(0);
    for(let i=0;i<length;i++)channelDataL[i] = arr[i];
    return buffer;
}
function keyboardHandler(){
    let n = Math.floor(mouseX/keyboardEl.offsetWidth*keys);
    let scale = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24];
    let hz = 440*2**(scale[n]/12);
    // log(n,mouseX,)
    cancelSound()
    
    noteOn(hz/880);
}
function noteOn(speed=1){
    let buffer = currentBuffer = audioCtx.createBufferSource();
    buffer.buffer = oscBuffer;
    buffer.playbackRate.value = speed;
    buffer.loop = true;

    let gainNode = currentGainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime + 0.2,1/4);
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime +   2,1/4);
    buffer.connect(gainNode);
    gainNode.connect(compressor);
    buffer.start(audioCtx.currentTime);
    buffer.stop(audioCtx.currentTime+3);
}
function cancelSound(){
    if(!currentBuffer)return;
    currentGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    currentGainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.1,1/10);
    currentBuffer.stop(audioCtx.currentTime+0.5);
}