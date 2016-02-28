const
  electron  =  require('electron'),
  ipcMain   =  electron.ipcRenderer;
var  menuMain = [
  { // 0
    label: 'Archivo',
    submenu: [
            {
        label: 'Mensaje',
        accelerator: 'CmdOrCtrl+M',
        click: (item, focusedWindow) =>{
          ipcMain.emit('message',{
            type:'none',//'warning',
            title:'Cerrar',
            header:'Adios',
            msg:'Aceptar => cerrar \n Cancelar => segir.'
            });
        }
      },
      { label: 'Imprimir :D',
        click: () => { 
          ipcMain.emit('imprimir');
        }  
      },
      { label: 'MenuItem2', type: 'checkbox', checked: true },
      {
        label:'File',
        accelerator: 'CmdOrCtrl+F',
        click: () => { 
          ipcMain.emit('file');
        }
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        type: 'separator'
      },
       {
        label: 'Preferancia ipcMain',
        click: (item, focusedWindow) => { 
          ipcMain.emit('show-prefs');
        }
      }
    ]
  },// 0
  /*{ // 1
    label: 'Arduino',
    submenu: [
      { // 0
        label: 'Auto-Conectar.',
        click : (item, focusedWindow) => {
          ipcMain.send('arduino');
        }
      },
      { //1
        label: 'Detectados.',
        submenu: [

        ]
      }
    ]
  },*/
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow)
{            focusedWindow.reload();}
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (() => {
          if (process.platform == 'darwin')
{            return 'Ctrl+Command+F';}
          else
{            return 'F11';}
        })(),
        click: (item, focusedWindow) =>{
          if (focusedWindow)
{            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());}
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          if (process.platform == 'darwin')
{            return 'Alt+Command+I';}
          else
{            return 'Ctrl+Shift+I';}
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
{            focusedWindow.toggleDevTools();}
        }
      },
    ]
  }
];


module.exports = {
  menuMain,
  addArduino : (ports) => {
    ports.forEach( port => {
      menuMain[1].submenu[1].submenu.push({
        label: port.manufacturer,
        click: (item, focusedWindow) => {
          ipcMain.emit('setArduino',port.comName);
        }
      });
    });   
  }
};