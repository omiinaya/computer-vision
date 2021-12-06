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
  const bLeft = videoElement.videoHeight
  c.width = 256;
  c.height = 144;
  c.getContext('2d')

  const ctx = c.getContext('2d')
  //ctx.filter = 'grayscale(1)' <-- was actually making readability worse.
  ctx.drawImage(videoElement, 0, bLeft-100, c.width, c.height, 0, 0, c.width, c.height);

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
}

function start() {
  timerId = setInterval(doOCR, 1000);
}

function stop() {
  clearInterval(timerId);
}

function test() {
  console.log(videoElement.videoWidth+ ' : '+videoElement.videoHeight)
}