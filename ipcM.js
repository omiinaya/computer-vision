const ipc = require('electron').ipcMain

ipc.on('REQUEST_TEST_1', function (evt, data) {
    console.log('TEST')
    //window.webContents.send('CHECK_RESPONSE', data)
})