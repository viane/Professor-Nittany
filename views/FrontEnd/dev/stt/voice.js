function Microphone(_options) {
  var options = _options || {};

  // we record in mono because the speech recognition service
  // does not support stereo.
  this.bufferSize = options.bufferSize || 8192;
  this.inputChannels = options.inputChannels || 1;
  this.outputChannels = options.outputChannels || 1;
  this.recording = false;
  this.requestedAccess = false;
  this.sampleRate = 16000;
  // auxiliar buffer to keep unused samples (used when doing downsampling)
  this.bufferUnusedSamples = new Float32Array(0);

  // Chrome or Firefox or IE User media
  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }

}

/**
 * Called when the user reject the use of the michrophone
 * @param  error The error
 */
Microphone.prototype.onPermissionRejected = function() {
  //console.log('Microphone.onPermissionRejected()');
  this.requestedAccess = false;
  this.onError('Permission to access the microphone rejeted.');
};

Microphone.prototype.onError = function(error) {
  //console.log('Microphone.onError():', error);
};

/**
 * Called when the user authorizes the use of the microphone.
 * @param  {Object} stream The Stream to connect to
 *
 */
Microphone.prototype.onMediaStream =  function(stream) {
  var AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtx)
    throw new Error('AudioContext not available');

  if (!this.audioContext)
    this.audioContext = new AudioCtx();

  var gain = this.audioContext.createGain();
  var audioInput = this.audioContext.createMediaStreamSource(stream);

  audioInput.connect(gain);

  this.mic = this.audioContext.createScriptProcessor(this.bufferSize,
    this.inputChannels, this.outputChannels);

  // uncomment the following line if you want to use your microphone sample rate
  //this.sampleRate = this.audioContext.sampleRate;
  //console.log('Microphone.onMediaStream(): sampling rate is:', this.sampleRate);

  this.mic.onaudioprocess = this._onaudioprocess.bind(this);
  this.stream = stream;

  gain.connect(this.mic);
  this.mic.connect(this.audioContext.destination);
  this.recording = true;
  this.requestedAccess = false;
  this.onStartRecording();
};

/**
 * callback that is being used by the microphone
 * to send audio chunks.
 * @param  {object} data audio
 */
Microphone.prototype._onaudioprocess = function(data) {
  if (!this.recording) {
    // We speak but we are not recording
    return;
  }

  // Single channel
  var chan = data.inputBuffer.getChannelData(0);

  //resampler(this.audioContext.sampleRate,data.inputBuffer,this.onAudio);

  this.onAudio(this._exportDataBufferTo16Khz(new Float32Array(chan)));

  //export with microphone mhz, remember to update the this.sampleRate
  // with the sample rate from your microphone
  // this.onAudio(this._exportDataBuffer(new Float32Array(chan)));

};

/**
 * Start the audio recording
 */
Microphone.prototype.record = function() {
  if (!navigator.getUserMedia){
    this.onError('Browser doesn\'t support microphone input');
    return;
  }
  if (this.requestedAccess) {
    return;
  }

  this.requestedAccess = true;
  navigator.getUserMedia({ audio: true },
    this.onMediaStream.bind(this), // Microphone permission granted
    this.onPermissionRejected.bind(this)); // Microphone permission rejected
};

/**
 * Stop the audio recording
 */
Microphone.prototype.stop = function() {
  if (!this.recording)
    return;
  this.recording = false;
  this.stream.getTracks()[0].stop();
  this.requestedAccess = false;
  this.mic.disconnect(0);
  this.mic = null;
  this.onStopRecording();
};

/**
 * Creates a Blob type: 'audio/l16' with the chunk and downsampling to 16 kHz
 * coming from the microphone.
 * Explanation for the math: The raw values captured from the Web Audio API are
 * in 32-bit Floating Point, between -1 and 1 (per the specification).
 * The values for 16-bit PCM range between -32768 and +32767 (16-bit signed integer).
 * Multiply to control the volume of the output. We store in little endian.
 * @param  {Object} buffer Microphone audio chunk
 * @return {Blob} 'audio/l16' chunk
 * @deprecated This method is depracated
 */
Microphone.prototype._exportDataBufferTo16Khz = function(bufferNewSamples) {
  var buffer = null,
    newSamples = bufferNewSamples.length,
    unusedSamples = this.bufferUnusedSamples.length;


  if (unusedSamples > 0) {
    buffer = new Float32Array(unusedSamples + newSamples);
    for (var i = 0; i < unusedSamples; ++i) {
      buffer[i] = this.bufferUnusedSamples[i];
    }
    for (i = 0; i < newSamples; ++i) {
      buffer[unusedSamples + i] = bufferNewSamples[i];
    }
  } else {
    buffer = bufferNewSamples;
  }

  // downsampling variables
  var filter = [
      -0.037935, -0.00089024, 0.040173, 0.019989, 0.0047792, -0.058675, -0.056487,
      -0.0040653, 0.14527, 0.26927, 0.33913, 0.26927, 0.14527, -0.0040653, -0.056487,
      -0.058675, 0.0047792, 0.019989, 0.040173, -0.00089024, -0.037935
    ],
    samplingRateRatio = this.audioContext.sampleRate / 16000,
    nOutputSamples = Math.floor((buffer.length - filter.length) / (samplingRateRatio)) + 1,
    pcmEncodedBuffer16k = new ArrayBuffer(nOutputSamples * 2),
    dataView16k = new DataView(pcmEncodedBuffer16k),
    index = 0,
    volume = 0x7FFF, //range from 0 to 0x7FFF to control the volume
    nOut = 0;

  for (var i = 0; i + filter.length - 1 < buffer.length; i = Math.round(samplingRateRatio * nOut)) {
    var sample = 0;
    for (var j = 0; j < filter.length; ++j) {
      sample += buffer[i + j] * filter[j];
    }
    sample *= volume;
    dataView16k.setInt16(index, sample, true); // 'true' -> means little endian
    index += 2;
    nOut++;
  }

  var indexSampleAfterLastUsed = Math.round(samplingRateRatio * nOut);
  var remaining = buffer.length - indexSampleAfterLastUsed;
  if (remaining > 0) {
    this.bufferUnusedSamples = new Float32Array(remaining);
    for (i = 0; i < remaining; ++i) {
      this.bufferUnusedSamples[i] = buffer[indexSampleAfterLastUsed + i];
    }
  } else {
    this.bufferUnusedSamples = new Float32Array(0);
  }

  return new Blob([dataView16k], {
    type: 'audio/l16'
  });
  };



// native way of resampling captured audio
var resampler = function(sampleRate, audioBuffer, callbackProcessAudio) {

  //console.log('length: ' + audioBuffer.length + ' ' + sampleRate);
  var channels = 1;
  var targetSampleRate = 16000;
  var numSamplesTarget = audioBuffer.length * targetSampleRate / sampleRate;

  var offlineContext = new OfflineAudioContext(channels, numSamplesTarget, targetSampleRate);
  var bufferSource = offlineContext.createBufferSource();
  bufferSource.buffer = audioBuffer;

  // callback that is called when the resampling finishes
  offlineContext.oncomplete = function(event) {
    var samplesTarget = event.renderedBuffer.getChannelData(0);
    //console.log('Done resampling: ' + samplesTarget.length + ' samples produced');

  // convert from [-1,1] range of floating point numbers to [-32767,32767] range of integers
  var index = 0;
  var volume = 0x7FFF;
    var pcmEncodedBuffer = new ArrayBuffer(samplesTarget.length*2);    // short integer to byte
    var dataView = new DataView(pcmEncodedBuffer);
    for (var i = 0; i < samplesTarget.length; i++) {
      dataView.setInt16(index, samplesTarget[i]*volume, true);
      index += 2;
    }

    // l16 is the MIME type for 16-bit PCM
    callbackProcessAudio(new Blob([dataView], { type: 'audio/l16' }));
  };

  bufferSource.connect(offlineContext.destination);
  bufferSource.start(0);
  offlineContext.startRendering();
};



/**
 * Creates a Blob type: 'audio/l16' with the
 * chunk coming from the microphone.
 */
var exportDataBuffer = function(buffer, bufferSize) {
  var pcmEncodedBuffer = null,
    dataView = null,
    index = 0,
    volume = 0x7FFF; //range from 0 to 0x7FFF to control the volume

  pcmEncodedBuffer = new ArrayBuffer(bufferSize * 2);
  dataView = new DataView(pcmEncodedBuffer);

  /* Explanation for the math: The raw values captured from the Web Audio API are
   * in 32-bit Floating Point, between -1 and 1 (per the specification).
   * The values for 16-bit PCM range between -32768 and +32767 (16-bit signed integer).
   * Multiply to control the volume of the output. We store in little endian.
   */
  for (var i = 0; i < buffer.length; i++) {
    dataView.setInt16(index, buffer[i] * volume, true);
    index += 2;
  }

  // l16 is the MIME type for 16-bit PCM
  return new Blob([dataView], { type: 'audio/l16' });
};

Microphone.prototype._exportDataBuffer = function(buffer){
  exportDataBuffer(buffer, this.bufferSize);
};


// Functions used to control Microphone events listeners.
Microphone.prototype.onStartRecording =  function() {};
Microphone.prototype.onStopRecording =  function() {};
Microphone.prototype.onAudio =  function() {};


var fileBlock = function(_offset, length, _file, readChunk) {
  var r = new FileReader();
  var blob = _file.slice(_offset, length + _offset);
  r.onload = readChunk;
  r.readAsArrayBuffer(blob);
};

// Based on alediaferia's SO response
// http://stackoverflow.com/questions/14438187/javascript-filereader-parsing-long-file-in-chunks
var onFileProgress = function(options, ondata, running, onerror, onend, samplingRate) {
  var file       = options.file;
  var fileSize   = file.size;
  var chunkSize  = options.bufferSize || 16000;  // in bytes
  var offset     = 0;
  var readChunk = function(evt) {
    if (offset >= fileSize) {
      //console.log('Done reading file');
      onend();
      return;
    }
    if(!running()) {
      return;
    }
    if (evt.target.error == null) {
      var buffer = evt.target.result;
      var len = buffer.byteLength;
      offset += len;
      ////console.log('sending: ' + len);
      ondata(buffer); // callback for handling read chunk
    } else {
      var errorMessage = evt.target.error;
      //console.log('Read error: ' + errorMessage);
      onerror(errorMessage);
      return;
    }
    // use this timeout to pace the data upload for the playSample case,
    // the idea is that the hyps do not arrive before the audio is played back
    if (samplingRate) {
    	// //console.log('samplingRate: ' +
      //  samplingRate + ' timeout: ' + (chunkSize * 1000) / (samplingRate * 2));
    	setTimeout(function() {
    	  fileBlock(offset, chunkSize, file, readChunk);
    	}, (chunkSize * 1000) / (samplingRate * 2));
    } else {
      fileBlock(offset, chunkSize, file, readChunk);
    }
  };
  fileBlock(offset, chunkSize, file, readChunk);
};

var createTokenGenerator = function() {
  // Make call to API to try and get token
  var hasBeenRunTimes = 0;
  return {
    getToken: function(callback) {
      ++hasBeenRunTimes;
      if (hasBeenRunTimes > 5) {
        var err = new Error('Cannot reach server');
        callback(null, err);
        return;
      }
      var url = '/api/speech-to-text/token';
      var tokenRequest = new XMLHttpRequest();
      tokenRequest.open('POST', url, true);
      tokenRequest.onreadystatechange = function() {
        if (tokenRequest.readyState === 4) {
          if (tokenRequest.status === 200) {
            var token = tokenRequest.responseText;
            callback(null, token);
          } else {
            var error = 'Cannot reach server';
            if (tokenRequest.responseText){
              try {
                error = JSON.parse(tokenRequest.responseText);
              } catch (e) {
                error = tokenRequest.responseText;
              }
            }
            callback(error);
          }
        }
      };
      tokenRequest.send();
    },
    getCount: function() { return hasBeenRunTimes; }
  };
};

var initPubSub = function() {
  var o         = $({});
  $.subscribe   = o.on.bind(o);
  $.unsubscribe = o.off.bind(o);
  $.publish     = o.trigger.bind(o);
};

// Mini WS callback API, so we can initialize
// with model and token in URI, plus
// start message

// Initialize closure, which holds maximum getToken call count
var tokenGenerator = createTokenGenerator();

var initSocket = function(options, onopen, onlistening, onmessage, onerror, onclose) {
  var listening;
  function withDefault(val, defaultVal) {
    return typeof val === 'undefined' ? defaultVal : val;
  }
  var socket;
  var token = options.token;
  var model = options.model || localStorage.getItem('currentModel');
  var message = options.message || {'action': 'start'};
  var sessionPermissions = withDefault(options.sessionPermissions,
    JSON.parse(localStorage.getItem('sessionPermissions')));
  var sessionPermissionsQueryParam = sessionPermissions ? '0' : '1';
  var url = options.serviceURI || 'wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=';
    url+= token + '&X-WDC-PL-OPT-OUT=' + sessionPermissionsQueryParam + '&model=' + model;
  //console.log('URL model', model);
  try {
    socket = new WebSocket(url);
  } catch(err) {
    generateNotice("error",'WS connection error: ', err);
  }
  socket.onopen = function() {
    listening = false;
    // $.subscribe('hardsocketstop', function() {
    //   //console.log('MICROPHONE: close.');
    //   //socket.send(JSON.stringify({action:'stop'}));
    //   socket.close();
    // });
    $.subscribe('socketstop', function() {
      //console.log('MICROPHONE: close.');
      socket.close();
    });
    socket.send(JSON.stringify(message));
    onopen(socket);
  };

  socket.onmessage = function(evt) {
    var msg = JSON.parse(evt.data);
    if (msg.error) {
      //session time out due to inactivity, don't thur error
      //showError(msg.error);
      $.publish('socketstop');
      return;
    }
    if (msg.state === 'listening') {
      // Early cut off, without notification
      if (!listening) {
        onlistening(socket);
        listening = true;
      } else {
        //console.log('MICROPHONE: Closing socket.');
        $.publish('socketstop');
      }
    }
    onmessage(msg, socket);
  };

  socket.onerror = function(evt) {
    //console.log('WS onerror: ', evt);
    showError('Application error ' + evt.code + ': please refresh your browser and try again');
    $.publish('clearscreen');
    onerror(evt);
  };

  socket.onclose = function(evt) {
    //console.log('WS onclose: ', evt);
    if (evt.code === 1006) {
      // Authentication error, try to reconnect
      //console.log('generator count', tokenGenerator.getCount());
      if (tokenGenerator.getCount() > 1) {
        $.publish('socketstop');
        throw new Error('No authorization token is currently available');
      }
      tokenGenerator.getToken(function(err, token) {
        if (err) {
          $.publish('socketstop');
          return false;
        }
        //console.log('Fetching additional token...');
        options.token = token;
        initSocket(options, onopen, onlistening, onmessage, onerror, onclose);
      });
      return false;
    }
    // if (evt.code === 1011) {
    //   generateNotice("warn",'Server error ' + evt.code + ': please refresh your browser and try again', _secToTimeUnit(3.5));
    //   return false;
    // }
    // if (evt.code > 1000) {
    //   generateNotice("warn",'Server error ' + evt.code + ': please refresh your browser and try again', _secToTimeUnit(3.5));
    //   return false;
    // }
    // Made it through, normal close
    //$.unsubscribe('hardsocketstop');
    //$.unsubscribe('socketstop');
    onclose(evt);
  };

};

var Alternatives = function(){

  var stringOne = '',
    stringTwo = '',
    stringThree = '';

  this.clearString = function() {
    stringOne = '';
    stringTwo = '';
    stringThree = '';
  };

  this.showAlternatives = function(alternatives, isFinal, testing) {
    var $hypotheses = $('.hypotheses ol');
    $hypotheses.empty();
    // $hypotheses.append($('</br>'));
    alternatives.forEach(function(alternative, idx) {
      var $alternative;
      if (alternative.transcript) {
        var transcript = alternative.transcript.replace(/%HESITATION\s/g, '');
        transcript = transcript.replace(/(.)\1{2,}/g, '');
        switch (idx) {
          case 0:
            stringOne = stringOne + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringOne + '</li>');
            break;
          case 1:
            stringTwo = stringTwo + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringTwo + '</li>');
            break;
          case 2:
            stringThree = stringThree + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringThree + '</li>');
            break;
        }
        $hypotheses.append($alternative);
      }
    });
  };
};

var alternativePrototype = new Alternatives();

var showResult = function(msg, baseString, model) {
  if (msg.results && msg.results.length > 0) {

    var alternatives = msg.results[0].alternatives;
    var text = msg.results[0].alternatives[0].transcript || '';

    // apply mappings to beautify
    text = text.replace(/%HESITATION\s/g, '');
    text = text.replace(/(.)\1{2,}/g, '');
    if (msg.results[0].final)
       //console.log('-> ' + text);
    text = text.replace(/D_[^\s]+/g,'');

    // if all words are mapped to nothing then there is nothing else to do
    if ((text.length === 0) || (/^\s+$/.test(text))) {
    	 return baseString;
    }

    // capitalize first word
    // if final results, append a new paragraph
    if (msg.results && msg.results[0] && msg.results[0].final) {
       text = text.slice(0, -1);
       text = text.charAt(0).toUpperCase() + text.substring(1);
        text = text.trim() + '. ';
       baseString += text;
       $('#resultsText').val(baseString);
       // Only show alternatives if we're final
       alternativePrototype.showAlternatives(alternatives);
    } else {
      text = text.charAt(0).toUpperCase() + text.substring(1);
      $('#resultsText').val(baseString + text);
    }
  }

  return baseString;
};

$.subscribe('clearscreen', function() {
  var $hypotheses = $('.hypotheses ul');
  scrolled = false;
  $hypotheses.empty();
  alternativePrototype.clearString();
});

var handleMicrophone = function(token, model, mic, callback) {

  if (model.indexOf('Narrowband') > -1) {
    var err = new Error('Microphone transcription cannot accomodate narrowband models, '+
      'please select another');
    callback(err, null);
    return false;
  }

  $.publish('clearscreen');

  // Test out websocket
  var baseString = '';
  var baseJSON = '';

  var options = {};
  options.token = token;
  options.message = {
    'action': 'start',
    'content-type': 'audio/l16;rate=16000',
    'interim_results': true,
    'continuous': true,
    'word_confidence': true,
    'timestamps': true,
    'max_alternatives': 3,
    'inactivity_timeout': 2000
  };
  options.model = model;

  function onOpen(socket) {
    //console.log('Mic socket: opened');
    callback(null, socket);
  }

  function onListening(socket) {

    mic.onAudio = function(blob) {
      if (socket.readyState < 2) {
        socket.send(blob);
      }
    };
  }

  function onMessage(msg) {
    if (msg.results) {
      baseString = showResult(msg, baseString, model);
    }
  }

  function onError() {
    //console.log('Mic socket err: ', err);
  }

  function onClose(evt) {
    //console.log('Mic socket close: ', evt);
  }

  initSocket(options, onOpen, onListening, onMessage, onError, onClose);
};

var showError = function(msg) {
  generateNotice("error", msg, _secToTimeUnit(3.5));
};

var initRecordButton = function(ctx) {

  var recordButton = $('#recordButton');

  recordButton.click((function() {

    var running = false;
    var token = ctx.token;
    var micOptions = {
      bufferSize: ctx.buffersize
    };
    var mic = new Microphone(micOptions);

    return function(evt) {
      // Prevent default anchor behavior
      evt.preventDefault();

      var currentModel = localStorage.getItem('currentModel');
      var currentlyDisplaying = localStorage.getItem('currentlyDisplaying');

      if (currentlyDisplaying=='sample'||currentlyDisplaying=='fileupload') {
        showError('Currently another file is playing, please stop the file or wait until it finishes');
        return;
      }
      localStorage.setItem('currentlyDisplaying', 'record');
      if (!running) {
        $('#resultsText').val('');   // clear hypotheses from previous runs
        //console.log('Not running, handleMicrophone()');
        handleMicrophone(token, currentModel, mic, function(err) {
          if (err) {
            var msg = 'Error: ' + err.message;
            //console.log(msg);
            showError(msg);
            running = false;
            localStorage.setItem('currentlyDisplaying', 'false');
          } else {
            recordButton.css('background-color', '#d74108');
            recordButton.text("Recording...");
            //console.log('starting mic');
            mic.record();
            running = true;
          }
        });
      } else {
        //console.log('Stopping microphone, sending stop action message');
        recordButton.removeAttr('style');
        recordButton.text("Start Recording");
        $.publish('hardsocketstop');
        mic.stop();
        running = false;
        localStorage.setItem('currentlyDisplaying', 'false');
      }
    };
  })());
};



window.BUFFERSIZE = 8192;
var models = [
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_BroadbandModel",
      "rate": 16000,
      "name": "en-US_BroadbandModel",
      "language": "en-US",
      "description": "US English broadband model (16KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_NarrowbandModel",
      "rate": 8000,
      "name": "en-US_NarrowbandModel",
      "language": "en-US",
      "description": "US English narrowband model (8KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_BroadbandModel",
      "rate": 16000,
      "name": "es-ES_BroadbandModel",
      "language": "es-ES",
      "description": "Spanish broadband model (16KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_NarrowbandModel",
      "rate": 8000,
      "name": "es-ES_NarrowbandModel",
      "language": "es-ES",
      "description": "Spanish narrowband model (8KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_BroadbandModel",
      "rate": 16000,
      "name": "pt-BR_BroadbandModel",
      "language": "pt-BR",
      "description": "Brazilian Portuguese broadband model (16KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_NarrowbandModel",
      "rate": 8000,
      "name": "pt-BR_NarrowbandModel",
      "language": "pt-BR",
      "description": "Brazilian Portuguese narrowband model (8KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_BroadbandModel",
      "rate": 16000,
      "name": "zh-CN_BroadbandModel",
      "language": "zh-CN",
      "description": "Mandarin broadband model (16KHz)"
   },
   {
      "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_NarrowbandModel",
      "rate": 8000,
      "name": "zh-CN_NarrowbandModel",
      "language": "zh-CN",
      "description": "Mandarin narrowband model (8KHz)"
   }
];

$(document).ready(function() {
  var tokenGenerator = createTokenGenerator();

  // Make call to API to try and get token
  tokenGenerator.getToken(function(err, token) {
    window.onbeforeunload = function() {
      localStorage.clear();
    };

    if (!token) {
      generateNotice("error",'No authorization token available');
      generateNotice("error",'Attempting to reconnect...');

      if (err && err.code)
        showError('Server error ' + err.code + ': '+ err.error);
      else
        showError('Server error ' + err.code + ': please refresh your browser and try again');
    }

    var viewContext = {
      currentModel: 'en-US_BroadbandModel',
      models: models,
      token: token,
      bufferSize: BUFFERSIZE
    };

    initRecordButton(viewContext);

    // Save models to localstorage
    localStorage.setItem('models', JSON.stringify(models));

    // Set default current model
    localStorage.setItem('currentModel', 'en-US_BroadbandModel');
    localStorage.setItem('sessionPermissions', 'true');


    $.subscribe('clearscreen', function() {
      $('#resultsText').text('');
    });

  });

});
