const { desktopCapturer } = require('electron');

const { createWorker, createScheduler } = Tesseract;
const videoElement = document.querySelector('video');
const scheduler = createScheduler();
let timerId = null;

document.addEventListener("DOMContentLoaded", function () {
  getVideoSources()
  initialize()
});

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

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  videoElement.srcObject = stream;
  videoElement.play()
}

async function doOCR() {
  const c = document.querySelector('canvas');
  const bLeft = videoElement.videoHeight - 60
  c.width = 1000;
  c.height = 70;
  const ctx = c.getContext('2d')

  ctx.scale(4, 4)
  ctx.imageSmoothingEnabled = false;
  ctx.filter = 'grayscale(1)'
  ctx.drawImage(videoElement, 33, bLeft, videoElement.videoWidth, videoElement.videoHeight, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

  const start = new Date();
  const { data: { text } } = await scheduler.addJob('recognize', c);
  const end = new Date()
  var message = `[${start.getMinutes()}:${start.getSeconds()} - ${end.getMinutes()}:${end.getSeconds()}], ${(end - start) / 1000} s`
  console.log(message);
  text.split('\n').forEach((line) => {
    console.log(line);
  });
};

async function initialize() {
  console.log('Initializing Tesseract.js');
  for (let i = 0; i < 4; i++) {
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
  }
  console.log('Initialized Tesseract.js');
  //start()
}

function start() {
  timerId = setInterval(doOCR, 500);
}

function stop() {
  clearInterval(timerId);
}

function test() {
  console.log(videoElement.videoWidth + ' : ' + videoElement.videoHeight)
}