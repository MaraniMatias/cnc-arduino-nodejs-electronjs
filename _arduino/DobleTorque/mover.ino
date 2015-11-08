// 01--
// -12-
// --23
// 0--3
void moverX(int sent){
  switch (sent) {
    case 1:
      pasoX(xp);
      xyzp[0]++;
      if(xp<3){
        xp++;
      }else{
        xp=0;
      }
    break;
    case 0:
      pasoX(xp);
      xyzp[0]--;
      if(xp>0){
        xp--;
      }else{
        xp=3;
      }
    break;
  }
}
void moverY(int sent){
  switch (sent) {
    case 0:
      pasoY(yp);
      xyzp[1]--;
      if(yp<3){
        yp++;
      }else{
        yp=0;
      }
    break;
    case 1:
      pasoY(yp);
      xyzp[1]++;
      if(yp>0){
        yp--;
      }else{
        yp=3;
      }
    break;
  }
}
void moverZ(int sent){
  switch (sent) {
    case 1:
      pasoZ(zp);
      xyzp[2]++;
      if(zp<3){
        zp++;
      }else{
        zp=0;
      }
    break;
    case 0:
      pasoZ(zp);
      xyzp[2]--;
      if(zp>0){
        zp--;
      }else{
        zp=3;
      }
    break;
  }
}
void pasoX(int i){
  if(tiempo!=0){
    int j=0;if(i!=3){j=i+1;}else{j=0;}
    digitalWrite(pinX[i],HIGH);
    digitalWrite(pinX[j],HIGH);
    delay(tiempo);
    digitalWrite(pinX[i],LOW);
    digitalWrite(pinX[j],LOW);
    delay(tiempo);
  }else{
    digitalWrite(pinX[i],LOW);
  }
}
void pasoY(int i){
  if(tiempo!=0){
    int j = 0;if(i!=3){j=i+1;}else{j=0;}
    digitalWrite(pinY[i],HIGH);
    digitalWrite(pinY[j],HIGH);
    delay(tiempo);
    digitalWrite(pinY[i],LOW);
    digitalWrite(pinY[j],LOW);
    delay(tiempo);
  }else{
    digitalWrite(pinY[i],LOW);
  }
}
void pasoZ(int i){
  if(tiempo!=0){
    //int j = 0;if(i!=3){j=i+1;}else{j=0;}
    digitalWrite(pinZ[i],HIGH);
    //digitalWrite(pinZ[j],HIGH);
    delay(tiempo);
    digitalWrite(pinZ[i],LOW);
    //digitalWrite(pinZ[j],LOW);
    delay(tiempo);
  }else{
    digitalWrite(pinZ[i],LOW);
  }
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
