# Proyecto CNCino con Arduino y NodeJS.
### Proyecto Router CNC sin drivers A4988 sin usar GRBL.

Este proyecto lo emprendimos con mi padre.
Uso librerías de tercero como Serialport, ElectronJS, AngularJS, jQuery, Semantic-ui (CSS) y VisJS.
El código del Arduino es de mi autoría, Use Arduino IDE v1.6.13.
La parte electrónica y la mecánica realizada conjuntamente.

Apartir de una imagen genra el codigo para poder realizar el trabajo, si tienes una imgane svg puedes usar [JScut](http://jscut.org/jscut.html) (medidas en milímetros) para obtener un GCode funcional.

![CNC Mar](https://github.com/MaraniMatias/router-cnc-nodejs-arduino/blob/dev/cnc-arduino-nodejs.png)

[Ver en YouTube un video resumen.](https://youtu.be/3uy0TsIahks) (primera versión)

## Circuito.
Consiste en un circuito rectificador de corriente, un circuito optoacoplador para cada motor el cual recibe pulso positivo según la correspondencia entre pin del Arduino y la bobina del motor paso a paso.

## Licencia.
Espero que a alguien más le sirva ([MIT](http://opensource.org/licenses/mit-license.php)).

**Autores:**
`Marani Cesar J.`
`Marani Matias E.`
