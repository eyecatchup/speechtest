window.onload = function() {
  document.querySelector('#startButton').addEventListener('click',Start);
  document.querySelector('#stopButton').addEventListener('click',Stop);
  document.querySelector('#muteButton').addEventListener('click',ToogleMute);
   document.querySelector('#blurButton').addEventListener('click',ToogleBlur);
   document.querySelector('#infoButton').addEventListener('click',function(){
     chrome.app.window.create(
    'info.html',
    {
      id: 'infoWindow',
      bounds: {width: 476, height: 343}, minWidth: 476, minHeight: 343, maxWidth: 476, maxHeight: 343
    }
  );
   });
  document.querySelector('#fullscreenButton').addEventListener('click',function(){
    if(!document.webkitIsFullScreen)
      document.documentElement.webkitRequestFullscreen();
    else
      document.webkitExitFullscreen();
  });

  document.addEventListener('webkitfullscreenchange',function(){
    if(!document.webkitIsFullScreen)
      document.querySelector('#fullscreenButton').innerHTML='<span class="icon-enlarge"></span>';
    else
      document.querySelector('#fullscreenButton').innerHTML='<span class="icon-shrink"></span>';
  });

  document.querySelector("#metronome").loop=true;
  document.querySelector('#timeSelect').addEventListener('focus',function(){
    this.select();
  });
  document.querySelector('#timeSelect').addEventListener('keyup',function(e){
    if(e.keyCode==13)
      document.querySelector('#startButton').click();
    return true;
  });
  document.querySelector('#timeSelect').focus();
  
  document.querySelector('#sensitivitySelect').addEventListener('focus',function(){
    this.select();
  });
  document.querySelector('#sensitivitySelect').addEventListener('keyup',function(e){
    if(e.keyCode==13)
      document.querySelector('#startButton').click();
    return true;
  });

  // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // grab an audio context
    audioContext = new AudioContext();

    document.querySelector('#meter').style.webkitFilter = "blur(1px)";
};

/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=1920.0;
var HEIGHT=10.0;
var x=0.0;
var rafID = null;
var t=60*1000*1;
var tt;
var clipc=0;
var sensitivity=0.75;
var n=0;
var mar;
var fl=false;
var sfl=false;
var xx;
var limit;
var sensitivity;
var fsound=true;
var fblur=true;

function ToogleMute(){
  if(fsound){
    fsound=false;
    document.querySelector('#muteButton').innerHTML='<span class="icon-volume-mute2"></span>';
    document.querySelector("#alarm").pause();
	  document.querySelector("#alarm").currentTime = 0;
	  document.querySelector("#metronome").pause();
	  document.querySelector("#metronome").currentTime = 0;
  }else{
    fsound=true;
    document.querySelector('#muteButton').innerHTML='<span class="icon-volume-high"></span>';
  }
}

function ToogleBlur(){
  if(fblur){
    fblur=false;
    document.querySelector('#meter').style.webkitFilter = "blur(0px)";
    document.querySelector('#blurButton').innerHTML='<span class="icon-radio-unchecked"></span>';
  }else{
    fblur=true;
    document.querySelector('#meter').style.webkitFilter = "blur(1px)";
    document.querySelector('#blurButton').innerHTML='<span class="icon-radio-checked"></span>';
  }
}

function Start(){
  limit = parseFloat(document.querySelector('#timeSelect').value);
  if(isNaN(limit)||(limit<0))
    limit=5;
  if(limit>60)
    limit=60;
  document.querySelector('#timeSelect').value=limit;
  
  sensitivity = parseFloat(document.querySelector('#sensitivitySelect').value);
  if(isNaN(sensitivity))
    sensitivity=10;
  if(sensitivity<10)
    sensitivity=10;
  if(sensitivity>98)
    sensitivity=98;
  document.querySelector('#sensitivitySelect').value=sensitivity;

  document.querySelector("#alarm").pause();
	document.querySelector("#alarm").currentTime = 0;
  sfl=false;
	t=parseFloat(limit)*60*1000;

    // grab our canvas
	tt=document.querySelector('#timer');
	canvasContext = document.querySelector('#meter').getContext("2d");
	canvasContext.clearRect(0,0,WIDTH,HEIGHT);

	Clear();
	document.querySelector('#stopButton').disabled="";
	document.querySelector('#startButton').disabled="disabled";
	document.querySelector('#timeSelect').disabled="disabled";
  document.querySelector('#sensitivitySelect').disabled="disabled";


        window.navigator.getUserMedia =
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        window.navigator.getUserMedia(
        {
            "video":false,"audio": {
                "mandatory": {
                    "googEchoCancellation": "true",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream);
}

function Stop(){
	sfl=true;
}

function Clear(){
	xx=0;
	mar=0;
	fl=false;
	n=0;
	clipc=0;
	x=0;
  document.querySelector("#metronome").pause();
	document.querySelector("#metronome").currentTime = 0;

	//tt.innerHTML='';
	sfl=false;
	document.querySelector('#stopButton').disabled="disabled";
	document.querySelector('#startButton').disabled="";
	document.querySelector('#timeSelect').disabled="";
	document.querySelector('#sensitivitySelect').disabled="";
	document.querySelector('#timeSelect').focus();
}

function didntGetStream() {
    console.log('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {

    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    sensitibity = parseFloat(document.querySelector('#sensitivitySelect').value)/100.0;
    meter = createAudioMeter(audioContext,sensitibity,0.75,125);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
	if(time==undefined)
		fl=false;
	else{
		if(fl==false){
			mar=time;
			fl=true;
			xx=0;
		}else{
			xx=x;
		}
	}
	x=WIDTH*(time-mar)/t;
	var y=meter.volume*HEIGHT*1.4;
	if(y>HEIGHT) y=HEIGHT;

	sec=parseInt((t-(time-mar))/1000.0);
	sec2=(sec%60).toString();
	sec=parseInt(sec/60);

	if(((sec===0)&&(sec2==9))||(limit<10/60))
	  if(fsound)
	    document.querySelector("#metronome").play();

	if(sec2.length<2) sec2='0'+sec2;

	tt.innerHTML=sec+":"+sec2;

	if(x>=WIDTH){
		meter.shutdown();
		tt.innerHTML=parseInt(clipc/n*100.0)+'%';
		document.querySelector("#metronome").pause();
	  document.querySelector("#metronome").currentTime = 0;
		if(fsound)
		  document.querySelector("#alarm").play();
		Clear();
		return;
	}

	var c=parseInt(255-(3000.0*(2-sensitibity)*y/HEIGHT));
	if(c>255) c=255;
	if(c<0) c=0;

    // check if we're currently clipping
    if (meter.checkClipping()){
        canvasContext.fillStyle = "rgba(255,0,0,.55)";
		clipc++;
    }else
         canvasContext.fillStyle = "rgba("+c+","+c+","+c+",.75)";
	n++;

    // draw a bar based on the current volume
    canvasContext.fillRect(xx, 0, x-xx, HEIGHT);

    // set up the next visual callback
    if(!sfl)
		  rafID = window.requestAnimationFrame( drawLoop );
	else{
		tt.innerHTML=parseInt(clipc/n*100.0)+'%';
		Clear();
	}
}

/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*

Usage:
audioNode = createAudioMeter(audioContext,clipLevel,averaging,clipLag);

audioContext: the AudioContext you're using.
clipLevel: the level (0 to 1) that you would consider "clipping".
   Defaults to 0.98.
averaging: how "smoothed" you would like the meter to be over time.
   Should be between 0 and less than 1.  Defaults to 0.95.
clipLag: how long you would like the "clipping" indicator to show
   after clipping has occured, in milliseconds.  Defaults to 750ms.

Access the clipping through node.checkClipping(); use node.shutdown to get rid of it.
*/

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(2048);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;
    var ax;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	ax = x = buf[i];
      if(ax<0) ax=-ax;
      
    	if (ax>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}


