export interface IElectronAPI {
  send: Function;
  receive: Function;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
