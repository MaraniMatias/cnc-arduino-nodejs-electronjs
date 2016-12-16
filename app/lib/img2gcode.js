var img2gcode = require('img2gcode');
/**
 * Interpret image to obtain g-code according to the specified configuration.
 + Using a child process.
 */
process.on('message', (option) => {
  if (option.dirImg) {
    console.log('img2gcode:\nReading Image: ', option.dirImg);
    img2gcode.start(option);
  }
  img2gcode.on('tick', (perc) => {
    process.send({ msj: 'tick', data: { perc } });
  })
  img2gcode.on('error', (err) => {
    process.send({msj: 'error', data : err.message });
  })
  .then((data) => {
    process.send({ msj: 'finished', data });
  });
});