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
  drawAudioChart(float32Array);
  console.log('pitch:', pitch);
  $('#pitch').text(pitch || 'no pitch detected');
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

function sendData(data) { console.log('sendData', data); }

$(chartBox).hide();
