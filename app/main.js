var app = require('app'); 
var os = require('os');

// Module to create native browser window.
var BrowserWindow = require('browser-window');
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1000, height: 620 });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/html/index.html');

  // Open the devtools.
  // mainWindow.openDevTools();
  // Emitted when the window is closed.
  mainWindow.on('closed',  () => {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

});