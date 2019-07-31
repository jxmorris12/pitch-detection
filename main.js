var myAudioBuffer;

var findPitch = function(myAudioBuffer) {
  // Finding the pitch of a WebAudio AudioBuffer in the browser
  const Pitchfinder = require("pitchfinder");
  const detectPitch = Pitchfinder.AMDF();
  console.log('detectPitch:', detectPitch);

  // const myAudioBuffer = getAudioBuffer(); // assume this returns a WebAudio AudioBuffer object
  const float32Array = myAudioBuffer.getChannelData(0); // get a single channel of sound
  console.log('float32Array:', float32Array);
  const pitch = detectPitch(float32Array); // null if pitch cannot be identified
  $('#pitch').text(noteFromPitch(pitch) || 'no pitch detected');
  drawAudioChart(float32Array);
}

var drawAudioChart = function(float32Array) {
  $(chartBox).show();
	Plotly.plot(audioChart,
      [{'y': float32Array}],
      {margin: { t: 0 } } );
}

var startRecording = function() {
  console.log('I was clicked!!')
  $('#recordButton').removeClass('startRecordButton')
                    .addClass('stopRecordButton');
  audioChunks = [];
  rec.start();
}

var stopRecording = function() {
  console.log('I was clicked')
  $('#recordButton').removeClass('stopRecordButton')
                    .addClass('startRecordButton');
  rec.stop();
}

recordButton.onclick = e => {
  console.log('click!');
  if($('#recordButton').hasClass('startRecordButton')) {
    startRecording();
  } else {
    stopRecording();
  }
}


navigator.mediaDevices.getUserMedia({audio:true})
  .then(stream => { handlerFunction(stream) });

var handlerFunction = function(stream) {
  rec = new MediaRecorder(stream);
  rec.ondataavailable = e => {
    audioChunks.push(e.data);
    if(rec.state == 'inactive') {
      console.log('audioChunks:', audioChunks)
      let blob = new Blob(audioChunks, { type: 'audio/mpeg-3' });
      recordedAudio.src = URL.createObjectURL(blob);
      recordedAudio.controls = true;
      recordedAudio.autoplay = true;

      let fileReader = new FileReader();
      let arrayBuffer;

      fileReader.onloadend = () => {
          arrayBuffer = fileReader.result;

          var audioCtx = new (AudioContext || webkitAudioContext)();
          console.log('decoding:', arrayBuffer);
          audioCtx.decodeAudioData(arrayBuffer).then(audioBuffer => {
            findPitch(audioBuffer);
          });
      }
      fileReader.readAsArrayBuffer(blob);
    }
  }
}

var arrayBufferToFloat32Array = function(buffer) { // incoming data is an ArrayBuffer
    var incomingData = new Uint8Array(buffer); // create a uint8 view on the ArrayBuffer
    var i, l = incomingData.length; // length, we need this for the loop
    var outputData = new Float32Array(incomingData.length); // create the Float32Array for output
    for (i = 0; i < l; i++) {
        outputData[i] = (incomingData[i] - 128) / 128.0; // convert audio to float
    }
    return outputData; // return the Float32Array
}

var noteFromPitch = function(pitch) {
  if(!pitch) {
    return pitch;
  }

  let minDiffNote = '?';
  let minDiff = 100000;

  const stringFreqs = {
      'e2': 82.4069,
      'a2': 110,
      'd3': 146.832,
      'g3': 195.998,
      'b3': 246.932,
      'e4': 329.628,
    };

  for(var note in stringFreqs) {
    const freq = stringFreqs[note];
    const freqDiff = Math.abs(freq - pitch);
    if (freqDiff < minDiff) {
      minDiff = freqDiff;
      minDiffNote = note;
    }
  }

  const error = minDiff * 100.0 / pitch;

  return minDiffNote + '(' + pitch + ' Hz)' + '[' + error + '%]';
}

function sendData(data) { console.log('sendData', data); }

$(chartBox).hide();
