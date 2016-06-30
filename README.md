# Proyecto Router CNC con Arduino y NodeJS.
### Proyecto Router CNC casero con Arduino y NodeJS, sin drivers A4988 sin usar GRBL.

Este proyecto lo emprendimos con mi padre.

Uso librerías de tercero como Serialport, Electron, AngularJS, jQuery, Semantic-ui (CSS) y VisJS.
El código del Arduino es de mi autoría y se puede compilar desde el IDE de Arduino. Las versiones superiores a 1.6.5 del IDE compilan bien pero Arduino  no actúa de forma deseada.

La parte electrónica y la mecánica realizada conjuntamente con mi padre.

Uso el G-code que genera jscut apartar de un SVG  con medidas en milímetro. http://jscut.org/jscut.html, Estoy trabajando crear el codigo desde una imagen.

Con el tiempo a medida que mejora mi experiencia con otros trabajos voy descubriendo errores y malas prácticas al programar, si tengo tiempo las voy a pulir.

## Demo.
![CNC Mar](https://github.com/MaraniMatias/router-cnc-nodejs-arduino/blob/dev/cnc-arduino-nodejs.jpg)

[Ver en YouTube un video resumen :D.](https://youtu.be/3uy0TsIahks) (primera vesion)

## Circuito.
Consiste en un circuito rectificador de CA a CC proporcionado por el trasformador , un circuito auto acoplador para cada motor el cual recibe un pulso + de un pin del Arduino el cual corresponde a una bobina del motor paso a paso.

## Licencia.
Espero que a alguien más le sirva  ([MIT](http://opensource.org/licenses/mit-license.php)).
Autores:
Marani Matias E.
Marani Cesar J.
