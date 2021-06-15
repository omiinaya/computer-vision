const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;
const videoElement = document.querySelector('video');

//on DOM load
document.addEventListener("DOMContentLoaded", function (event) {
  getVideoSources()
});

//get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    
    inputSources.map(source => {
      console.log(source.name)
      console.log(source)
      if (source.name === 'Screen 1') {
        selectSource(source)
      }
    })
  );
  videoOptionsMenu.popup();
}

//change the videoSource window to record
async function selectSource(source) {

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
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