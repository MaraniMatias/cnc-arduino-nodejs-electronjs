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
  r2x=0;
  r2y=0;
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
