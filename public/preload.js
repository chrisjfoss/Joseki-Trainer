const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('api', {
    send: (event, data) => {
        ipcRenderer.send(event, data);
    },
    receive: (event, callback) => {
        ipcRenderer.on(event, (event, ...data) => {
            callback(data);
        });
    },
    receiveOnce: (event, callback) => {
        ipcRenderer.once(event, (event, ...data) => {
            callback(data);
        });
    }
})