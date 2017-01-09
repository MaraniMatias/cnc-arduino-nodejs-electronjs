void StatusLED(){
  digitalWrite(pinLED,bStatusLED  ? 1 : 0);
  bStatusLED = !bStatusLED;
}

void PauseStop(){
  sendData();
  start = false;
  xyzp[0]=0;
  xyzp[1]=0;
  xyzp[2]=0;
  rx=0;
  ry=0;
  _saveAddX=0;
  _saveAddY=0;
}

void sendData(){
  Serial.print(xyzp[0]);
  Serial.print(',');
  Serial.print(xyzp[1]);
  Serial.print(',');
  Serial.println(xyzp[2]);
}

void render(){
  ry=0;
  rx=0;
  _delayX  = 0;
  _delayY  = 0;
  addX = 0;
  addY = 0;
  long auxX=xyzp[0],auxY=xyzp[1];
  // si son distintos realizo calculos para corregir errores
  if(auxX!=auxY){
    if(auxX<0){auxX = auxX*-1;}
    if(auxY<0){auxY = auxY*-1;}
    if(auxX<auxY){
    // mayor Y
      _delayX  = floor(auxY / auxX);
      long rta = auxY - auxX*_delayX;
      _saveAddY = floor(auxX*_delayX / rta);
      addY = auxY - _saveAddY;
      rx = _delayX;
    }else{
    // mayor X
      _delayY  = floor(auxX / auxY);
      long rta = auxX - auxY*_delayY;
      _saveAddX = floor(auxY*_delayY / rta);
      addX = auxX - _saveAddX;
      ry = _delayY;
    }
  }//auxX!=auxY
  
/* 
  // debug
  Serial.print("X: ");Serial.println(xyzp[0]);
  Serial.print("Y: ");Serial.println(xyzp[1]);
  Serial.print("rx ");Serial.println(_delayX);
  Serial.print("ry ");Serial.println(_delayY);
  Serial.print("addX ");Serial.println(addX);
  Serial.print("addY ");Serial.println(addY);
  Serial.println("-----------");
*/

}
// Author: Marani Matias Ezequiel
// Email: maranimatias@gmail.com
