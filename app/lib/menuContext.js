module.exports = [
  { // 0
    label: 'Abrir G-Code...',
    accelerator: 'CmdOrCtrl+F',
    enabled: true,
    click: () => {
      ipcRenderer.send('open-file', { initialLine: undefined, fileDir: undefined });
    }
  },
  { // 1
    label: 'Ver Tabla de Lineas',
    enabled: true,
    click: (item, focusedWindow) => {
      ipcRenderer.send('show-lineTable');
    }
  },
  { // 2
    type: 'separator'
  },
  { // 3
    label: 'Buscar Arduino',
    enabled: true,
    click: (item, focusedWindow) => {
      ipcRenderer.send('arduino');
    }
  }
]