var img2gcode = require('img2gcode');

process.on('message', (option) => {
  if (option.dirImg) {
    console.log('Reading Image: ', option.dirImg);
    img2gcode.start(option);
  }
  img2gcode.on('tick', (perc) => {
    process.send({ msj: 'tick', data: { perc } });
  })
  .then((data) => {
    process.send({ msj: 'finished', data });
  });
});