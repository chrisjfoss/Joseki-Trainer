import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  send: (event: any, data: Function) => {
    ipcRenderer.send(event, data);
  },
  receive: (event: any, callback: Function) => {
    ipcRenderer.on(event, (event, ...data) => {
      callback(data);
    });
  },
  receiveOnce: (event: any, callback: Function) => {
    ipcRenderer.once(event, (event, ...data) => {
      callback(data);
    });
  }
});
