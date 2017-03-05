import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

let menu;
let mainWindow = null;

const urlDriveHome = 'https://drive.google.com';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    // TODO: Use async interation statement.
    //       Waiting on https://github.com/tc39/proposal-async-iteration
    //       Promises will fail silently, which isn't what we want in development
    return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log);
  }
};

app.on('ready', async () => {

  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(urlDriveHome);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Make sure any other documents open in the same window
  mainWindow.webContents.on('new-window', async (event, url) => {
    event.preventDefault();
    mainWindow.loadURL(url);
    // let newWindow = new BrowserWindow({
    //   show: false,
    //   width: 1024,
    //   height: 728
    // });

    // newWindow.loadURL(url);

    // newWindow.webContents.on('did-finish-load', () => {
    //   newWindow.show();
    //   newWindow.focus();
    // });

    // newWindow.on('closed', () => {
    //   newWindow = null;
    // });
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menu = menuBuilder.buildMenu(process.env.NODE_ENV, process.platform);

});
