var img2gcode = require('img2gcode');

process.on('message', (option) => {
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
  }else { // if (option.end)
    process.nextTick(() => {
      process.exit(0);
    });
  }
  img2gcode.on('tick', (perc) => {
    process.send({ msj: 'tick', data:{perc} });
  })
  .then((dirgcode) => {
    process.send({ msj: 'finished', data:{dirgcode} });
  });
});