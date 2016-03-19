module.exports = [
  {
    label: 'Contexmenu',
    submenu: [
      {
        label:'File',
        accelerator: 'CmdOrCtrl+F',
        click: () => { 
          ipcRenderer.send('file');
        }
      },
      {
        type: 'separator'
      },
       {
        label: 'Preferancia ipcRenderer',
        click: (item, focusedWindow) => { 
          ipcRenderer.send('show-prefs');
        }
      }
    ]
  },
  { // 1
    label: 'Arduino',
    submenu: [
      { // 0
        label: 'Auto-Conectar.',
        click : (item, focusedWindow) => {
          ipcRenderer.send('arduino');
        }
      }]
  },
  {
    label: 'Heramientas',
    submenu: [
      {
        label: 'Mensaje',
        accelerator: 'CmdOrCtrl+M',
        click: (item, focusedWindow) =>{
          ipcRenderer.send('message',{
            type:'none',//'warning',
            title:'Cerrar',
            header:'Adios',
            msg:'Aceptar => cerrar \n Cancelar => segir.'
            });
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow)
           { focusedWindow.reload();}
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (() => {
          if (process.platform == 'darwin')
           { return 'Ctrl+Command+F';}
          else
            {return 'F11';}
        })(),
        click: (item, focusedWindow) =>{
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          if (process.platform == 'darwin') {
             return 'Alt+Command+I';
          }
          else{
            return 'Ctrl+Shift+I';
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow){
             focusedWindow.toggleDevTools();
          }
        }
      },
    ]
  }
]
;

