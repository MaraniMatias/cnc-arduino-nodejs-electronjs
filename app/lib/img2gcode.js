var img2gcode = require('img2gcode');

process.on('message', (option) => {
  img2gcode.on('tick', (perc) => {
    process.send({ msj: 'tick', perc });
  })
  .then((data) => {
    process.send({ msj: 'finiged', data });
  });
  if (option.dirImg) {
    console.log('Reading Image: ', option.dirImg);
    img2gcode.start({  // It is mm
      toolDiameter: 1,
      scaleAxes: 700,
      deepStep: -1,
      whiteZ: 0,
      blackZ: -2,
      sevaZ: 2,
      info: "emitter",
      dirImg: option.dirImg
    })
  }
  if (option.end) {
    process.nextTick(() => {
      process.exit(0);
    });
  }
});