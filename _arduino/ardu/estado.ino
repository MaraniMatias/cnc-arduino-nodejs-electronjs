void estado(){
  if(bEstado){
    digitalWrite(pinEstado,HIGH);
  }else{
    digitalWrite(pinEstado,LOW);
  }
  bEstado = !bEstado;
}

void pararpausa(){
  Serial.print('[');
  Serial.print(xyzp[0]);
  Serial.print(',');
  Serial.print(xyzp[1]);
  Serial.print(',');
  Serial.print(xyzp[2]);
  Serial.print(']');
  xyzp[0]=0;
  xyzp[1]=0;
  xyzp[2]=0;
  rx=0;
  ry=0;
  addX=0;
  addY=0;
  comenzar=false;
}

void llevaraCerro(){
  if(x==true||y==true||z==true){
    bx = digitalRead(btnX);
    by = digitalRead(btnY);
    bz = digitalRead(btnZ);

    if(bx == HIGH){x=false;}
    if(by == HIGH){y=false;}
    if(bz == HIGH){z=false;}

    if(x){moverX(1);}
    if(y){moverY(1);}
    if(z){moverZ(1);}
  }
}

void render(){
// [5608,1924,0]
// [36,19,0]
// [53,12,0]
// [31,5,0]
  ry=0;
  rx=0;
  retardox  = 0;
  retardoy  = 0;
  agregarCadaX = 0;
  agregarCadaY = 0;
  double auxX=0,auxY=0;
  auxX = xyzp[0];
  auxY = xyzp[1];
  if(auxX!=auxY){
  //si es negativo lo paso a positivo para la division
  if(auxX<0){auxX = auxX*-1;}
  if(auxY<0){auxY = auxY*-1;}
  // si son distintos realizo calculos para corregir errores
  if(auxX<auxY){
  // mayor Y
    retardox  = floor(auxY / auxX);
    int rta = auxY - auxX*retardox;
    addY = floor(auxX*retardox / rta);
    agregarCadaY = auxY -addY;
    rx=retardox;
  }else{
  // mayor X
    retardoy  = floor(auxX / auxY);
    int rta = auxX - auxY*retardoy;
    addX = floor(auxY*retardoy / rta);
    agregarCadaX = auxX - addX;
    ry=retardoy;
  }
  }//auxX!=auxY
  if(debug){
    Serial.print("auxX: ");Serial.println(auxX);
    Serial.print("auxY: ");Serial.println(auxY);
    Serial.print("rx ");Serial.println(retardox);
    Serial.print("ry ");Serial.println(retardoy);
    Serial.print("agregarCadaX ");Serial.println(agregarCadaX);
    Serial.print("agregarCadaY ");Serial.println(agregarCadaY);
  }
}
