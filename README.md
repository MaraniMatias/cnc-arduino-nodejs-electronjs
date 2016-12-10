# Proyecto Router CNC con Arduino y NodeJS.
### Proyecto Router CNC sin drivers A4988 sin usar GRBL.

Este proyecto lo emprendimos con mi padre.

Uso librerías de tercero como Serialport, ElectronJS, AngularJS, jQuery, Semantic-ui (CSS) y VisJS.
El código del Arduino es de mi autoría y se puede compilar desde el IDE de Arduino. Las versiones superiores a 1.6.5 del IDE compilan bien, pero Arduino no actúa de forma deseada.

La parte electrónica y la mecánica realizada conjuntamente con mi padre.

Apartir de una imagen genra el codigo para poder realizar el trabajo, si tienes una imgane svg puedes usar [JScut](http://jscut.org/jscut.html) (medidas en milímetros) para obtener un GCode funcional.

Con el tiempo a medida que mejora mi experiencia con otros trabajos voy descubriendo errores y malas prácticas al programar, si tengo tiempo las voy a pulir.

![CNC Mar](https://github.com/MaraniMatias/router-cnc-nodejs-arduino/blob/dev/cnc-arduino-nodejs.jpg)

[Ver en YouTube un video resumen.](https://youtu.be/3uy0TsIahks) (primera versión)

## Circuito.
Consiste en un circuito rectificador de corriente, un circuito auto acoplador para cada motor el cual recibe un pulso positivo según la correspondencia entre pin del Arduino y la bobina del motor paso a paso.

## Licencia.
Espero que a alguien más le sirva ([MIT](http://opensource.org/licenses/mit-license.php)).

**Autores:**
`Marani Cesar J.`
`Marani Matias E.`