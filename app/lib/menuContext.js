module.exports = [
  { // 1
    label: 'Arduino-Conectar.',
    click : (item, focusedWindow) => {
      ipcRenderer.send('arduino');
    }
  }
]
;