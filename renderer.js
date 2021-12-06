const { desktopCapturer } = require('electron');
//const Tesseract = require('tesseract.js')

const { createWorker, createScheduler } = Tesseract;
const videoElement = document.querySelector('video');
const scheduler = createScheduler();
const video = document.getElementById('video');
let timerId = null;

//on DOM load
document.addEventListener("DOMContentLoaded", function (event) {
  getVideoSources()
});

//get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });
  
  inputSources.map(source => {
    if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
      selectSource(source)
    }
  })
}

//change the videoSource window to record
async function selectSource(source) {

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      }
    }
  };

  //create a Stream
  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);

  //preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();
}

async function doOCR() {
  const c = document.querySelector('canvas');
  c.width = 300;
  c.height = 200;
  c.getContext('2d')

  const ctx = c.getContext('2d')
  ctx.filter = 'grayscale(1)'
  ctx.drawImage(video, 0, 0, 300, 200);

  const start = new Date();
  const { data: { text } } = await scheduler.addJob('recognize', c);
  const end = new Date()
  console.log(`[${start.getMinutes()}:${start.getSeconds()} - ${end.getMinutes()}:${end.getSeconds()}], ${(end - start) / 1000} s`);
  text.split('\n').forEach((line) => {
    console.log(line);
  });
};

(async () => {
  console.log('Initializing Tesseract.js');
  for (let i = 0; i < 4; i++) {
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
  }
  console.log('Initialized Tesseract.js');
  video.addEventListener('play', () => {
    timerId = setInterval(doOCR, 1000);
  });
  video.addEventListener('pause', () => {
    clearInterval(timerId);
  });
  console.log('Now you can play the video. :)');
  video.controls = true;
})();