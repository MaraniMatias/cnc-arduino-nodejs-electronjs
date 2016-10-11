/* 
  Please use IDE Arduino 1.6.5 with versions 1.6.6 and 1.6.7 code behaves not expected.
  Por favor utilice el IDE Arduino 1.6.5, para un correcto funcionamiento.
  Author: Marani Matias Ezequiel
  Email: maranimatias@gmail.com
*/
#include <math.h>

// seting:START
const bool debug = false;    // Debug
const int pinLED = 13,       // LED StatusLED indicator
    pinX[] = {0, 1, 3, 2},   // Motor pin X
    pinY[] = {4, 5, 7, 6},   // Motor pin Y
    pinZ[] = {8, 10, 9, 11}, // Motor pin Z
    timeMin = 14;
// seting:END

bool bStatusLED = true; // StatusLED indicator var

int xyzp[] = {0, 0, 0, 0},  // Steps to go
    xp = 0, yp = 0, zp = 0, // Save last step used
    _delayX = 0, _delayY = 0, rx = 0, ry = 0,
    addX = 0, addY = 0, _saveAddX = 0, _saveAddY = 0, // when the angles are different from 90° or 45°
    i = 0, inChar = 0, _time = 28;                    // Time between step //~14
String inString = "";
boolean start = false;

void setup() {
  Serial.begin(9600);
  pinMode(pinLED, OUTPUT); // LED inicador

  //---Motor:START
  pinMode(pinX[0], OUTPUT);
  pinMode(pinX[1], OUTPUT);
  pinMode(pinX[2], OUTPUT);
  pinMode(pinX[3], OUTPUT);
  //---
  pinMode(pinY[0], OUTPUT);
  pinMode(pinY[1], OUTPUT);
  pinMode(pinY[2], OUTPUT);
  pinMode(pinY[3], OUTPUT);
  //---
  pinMode(pinZ[0], OUTPUT);
  pinMode(pinZ[1], OUTPUT);
  pinMode(pinZ[2], OUTPUT);
  pinMode(pinZ[3], OUTPUT);
  //---Motor:END
}

void loop() {
  if (start){

    if (_delayX == 0){
      _delayX = rx;
      if (_delayY > 0){
        _delayY--;
      } else {
        _delayY = 0;
      }
      if (0 < xyzp[0]){
        MoveX(0);
      }
      if (0 > xyzp[0]){
        MoveX(1);
      }

      //Insert X
      if (addX == xyzp[0] && _saveAddX != 0){
        if (0 < xyzp[0]){
          MoveX(0);
          addX = xyzp[0] - _saveAddX;
        }
        if (0 > xyzp[0]){
          MoveX(1);
          addX = xyzp[0] + _saveAddX;
        }
      }
      //Insert X

      if (ry == 0){
        render();
      }
    }

    if (_delayY == 0){
      _delayY = ry;
      if (_delayX > 0) {
        _delayX--;
      } else {
        _delayX = 0;
      }
      if (0 < xyzp[1]) {
        MoveY(0);
      }
      if (xyzp[1] < 0){
        MoveY(1);
      }

      //Insert Y
      if (addY == xyzp[1] && _saveAddY != 0){
        if (0 < xyzp[1]) {
          MoveY(0);
          addY = xyzp[1] - _saveAddY;
        }
        if (0 > xyzp[1] ) {
          MoveY(1);
          addY = xyzp[1] + _saveAddY;
        }
      }
      //Insert Y

      if (rx == 0) {
        render();
      }
    }

    if (0 < xyzp[2]) {
      MoveZ(0);
    }
    if (xyzp[2] < 0) {
      MoveZ(1);
    }

    if (debug) {
      sendData();
    }

    if (xyzp[0] == 0 && xyzp[1] == 0 && xyzp[2] == 0) {
      start = false;
      sendData();
      digitalWrite(pinLED, LOW);
    }
  }

  while (Serial.available() > 0) {
    int inChar = Serial.read();
    if (inChar != ',') {
      if (inChar == 'p') {
        PauseStop();
      }
      if (inChar == '-') {
        inString += "-";
      }
      if (isDigit(inChar)) {
        inString += (char)inChar;
        if (i < 3) {
          xyzp[i] = inString.toInt();
        }
        if (i == 3) {
          int f = inString.toInt();
          _time = f >= timeMin ? f : timeMin;

        }
      }
    } else {
      i++;
      inString = "";
    }
    if (inChar == '\n' || inChar == ';') {
      i = 0;
      inString = "";
      render();
      start = true;
    }
  } // leer entrada

} // loop