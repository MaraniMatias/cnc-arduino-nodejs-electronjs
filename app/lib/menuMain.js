module.exports = [
  {
    label: 'Archivo',
    submenu: [
      {
        label:'Abrir G-Code...',
        accelerator: 'CmdOrCtrl+F',
        click: () => { 
          ipcRenderer.send('open-file',{initialLine :undefined, fileDir :undefined});
        }
      },
      {
        label: 'Buscar Arduino',
        click : (item, focusedWindow) => {
          ipcRenderer.send('arduino');
        }
      },
      {type: 'separator'},
      {
        label: 'Ver Tabla de Lineas',
        click: (item, focusedWindow) => { 
          ipcRenderer.send('show-lineTable');
        }
      },
      {
        label: 'Preferancia',
        click: (item, focusedWindow) => { 
          ipcRenderer.send('show-prefs');
        }
      },
      {type: 'separator'},
      {
        label: 'Salir',
        role: 'close'
      }
    ]
  },
  {
    label: 'Ayuda',
    submenu: [
      {
        label: 'Recargar Ventana',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Pantalla completa',
        accelerator: (() => {
          if (process.platform == 'darwin'){
            return 'Ctrl+Command+F';
          }else{
            return 'F11';
          }
        })(),
        click: (item, focusedWindow) =>{
          if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Herramientas de desarrollo',
        accelerator: (() => {
          if (process.platform == 'darwin'){
            return 'Alt+Command+I';
          }else{
            return 'Ctrl+Shift+I';
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)  focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Acerca De',
        click: (item, focusedWindow) => {
          ipcRenderer.send('about',{});
        }
      }
    ]
  }
];