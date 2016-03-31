var menu = [
  { // 0
    label: 'Archivo',
    submenu: [
      /*{
        label:'Nuevo',
        accelerator: 'CmdOrCtrl+N',
        click: () => { 
          ipcRenderer.send('file-new');
        }
      },*/
      {
        label:'Abrir G-Code...',
        accelerator: 'CmdOrCtrl+F',
        click: () => { 
          ipcRenderer.send('open-file');
        }
      },
      {
        label: 'Preferancia',
        click: (item, focusedWindow) => { 
          ipcRenderer.send('show-prefs');
        }
      },
      {
        type: 'separator'
      },
      /*{
        label: 'Cerrar',
        accelerator: 'CmdOrCtrl+Q',
        role: 'close'
      },*/
      {
        label: 'Salir',
        accelerator: 'CmdOrCtrl+Q',
        role: 'close'
      }
    ]
  },// 0
  { // 1
    label: 'Arduino',
    submenu: [
      {
        label: 'Auto-Conectar',
        click : (item, focusedWindow) => {
          ipcRenderer.send('arduino');
        }
      },
      {
        type: 'separator'
      }/*,
      {
        label: 'Comenzar',
        click : (item, focusedWindow) => {
          ipcRenderer.send('');
        }
      },
      {
        label: 'Pausa',
        click : (item, focusedWindow) => {
          ipcRenderer.send('');
        }
      },
      {
        label: 'Parar',
        click : (item, focusedWindow) => {
          ipcRenderer.send('');
        }
      },
      {
        type: 'separator'
      }*/
    ]
  },
  {
    label: 'Ayuda',
    submenu: [
      //{ label: 'MenuItem2', type: 'checkbox', checked: true },
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

module.exports = {
  menu,
  addArduino : (ports) => {
    ports.forEach( port => {
      menu[1].submenu.push({
        label: port.manufacturer,
        click: (item, focusedWindow) => {
          ipcRenderer.send('setArduino',port.comName);
        }
      });
    });
  }
};

// pedir automaticamente los arduinos :D