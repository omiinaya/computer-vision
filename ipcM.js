const ipc = require('electron').ipcMain

ipc.on('PRINT_REQUEST', function (evt, data) {
    console.log(data)
})