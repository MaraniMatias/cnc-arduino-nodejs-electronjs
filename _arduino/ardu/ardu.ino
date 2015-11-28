#include <math.h>
// seting:START
const bool debug = false; // debug
const int pinEstado = 13; // ledEstado
const int pinX[] = {0,1,2,3}; // pin de motores
const int pinY[] = {4,5,6,7}; // pin de motores
const int pinZ[] = {8,9,10,11}; // pin de motores
const int btnX=A5,btnY=A4,btnZ=A3;// finales de carrera
float tiempo = 25; // tiempo entre paso
// seting:END

bool bEstado = true,     // para indicar estados
x=false,y=false,z=false; // para indicar cuando esta en 0,0,0

int bx,by,bz,// variable para finales de carrera
xyzp[] = {0,0,0}, // cantidad de pasos para cade eje
xp=0,yp=0,zp=0,  // guardar ultimo paso usado
retardox=0,retardoy=0,rx=0,ry=0,retardo2x=0,retardo2y=0,r2x=0,r2y=0;//guardar para desvio o angulos distintos a 45

int i=0, inChar=0; String inString = "";
bool comenzar = false;

void setup() {
  Serial.begin(9600);
  //--fianles de carrera
  pinMode(btnX,INPUT);
  pinMode(btnY,INPUT);
  pinMode(btnZ,INPUT);
  //--
  pinMode(pinEstado,OUTPUT);// LED inicador
  //---Motor:START
  pinMode(pinX[0],OUTPUT);
  pinMode(pinX[1],OUTPUT);
  pinMode(pinX[2],OUTPUT);
  pinMode(pinX[3],OUTPUT);
  //---
  pinMode(pinY[0],OUTPUT);
  pinMode(pinY[1],OUTPUT);
  pinMode(pinY[2],OUTPUT);
  pinMode(pinY[3],OUTPUT);
  //---
  pinMode(pinZ[0],OUTPUT);
  pinMode(pinZ[1],OUTPUT);
  pinMode(pinZ[2],OUTPUT);
  pinMode(pinZ[3],OUTPUT);
  //---Motor:END
}

void loop() {

while(Serial.available()){
  int inChar = Serial.read();
  if(inChar!=','){
    //if (inChar == 'o' ) {x=true;y=true;z=true;}
    //if (inChar == 'p' ) {pararpausa();}
    if(inChar=='-'){
      inString += "-";
    }
    if (isDigit(inChar)){
      inString += (char)inChar;
      xyzp[i]=inString.toInt();
    }
  }else{
    i++;
    inString="";
  }
  if (inChar == '\n' || inChar == ';' ) {
    // limpiar variables de entrada
    i=0;
    inString = "";
    //Analisis de pasos
    if(x==false||y==false||z==false){
      // [5608,1924,0]
      double auxX=0,auxY=0;
      auxX = xyzp[0];// pasos de eje x
      auxY = xyzp[1];// pasos de eje y
      //si es negativo lo paso a positivo para la division
      if(auxX<0){auxX = auxX*-1;}
      if(auxY<0){auxY = auxY*-1;}
      // si son distintos realizo calculos de retardo
      if(auxX!=auxY){
        if(auxX<auxY){ // mayor Y
          retardox  = round(auxY / auxX); //
          int rta = auxY - auxX*round(auxY / auxX);
          retardo2y = floor(auxX / rta);
          rta = rta>0? rta : rta*-1;
          retardoy  = 0;
          retardo2x = 0;
        }else{ // mayor X
          retardoy  = round(auxX / auxY);// 3
          int rta = auxX - auxY*round(auxX / auxY);// 5608 - 5772 = -164
          rta = rta>0? rta : rta*-1;
          retardo2x = floor(auxY / rta);// 11
          retardox  = 0;
          retardo2y = 0;
        }
      }//auxX!=auxY

  if(debug){
    Serial.print("auxX: ");Serial.println(auxX);
    Serial.print("auxY: ");Serial.println(auxY);
    Serial.print("rx ");Serial.println(retardox);
    Serial.print("r2x ");Serial.println(retardo2x);
    Serial.print("ry ");Serial.println(retardoy);
    Serial.print("r2y ");Serial.println(retardo2y);
  }

      rx=retardox;
      ry=retardoy;
      r2x=retardo2x;
      r2y=retardo2y;
      comenzar=true;
    }
  }
}// leer entrada

//llevaraCerro();

if(comenzar){

  if(retardox==0){
    if(retardo2x>0){retardo2x--;}
    if(retardoy>0){retardoy--;}
    retardox=rx;

    if(0<xyzp[0]){
      moverX(0);
      if(retardo2x==0 && r2x!=0){
        moverX(0);
        // innsertar Y
        /*if(0<xyzp[1]){
          moverY(0);
        }
        if(xyzp[1]<0){
          moverY(1);
        }*/
        retardo2x=r2x;
      }
    }
    if(0>xyzp[0]){
      moverX(1);
      if(retardo2x==0 && r2x!=0){
        moverX(1);
        // innsertar Y
        /*if(0<xyzp[1]){
          moverY(0);
        }
        if(xyzp[1]<0){
          moverY(1);
        }*/
        retardo2x=r2x;
      }
    }

  }

  if(retardoy==0){
    if(retardo2y>0){retardo2y--;}
    if(retardox>0){retardox--;}
    retardoy=ry;

    if(0<xyzp[1]){
      moverY(0);
      if(retardo2y==0 && r2y!=0){
        moverY(0);
        // innsertar X
        /*if(0<xyzp[0]){
          moverX(0);
        }
        if(xyzp[0]<0){
          moverX(1);
        }*/
        retardo2y=r2y;
      }
    }
    if(xyzp[1]<0){
      moverY(1);
      if(retardo2y==0 && r2y!=0){
        moverY(1);
        // innsertar X
        /*if(0<xyzp[0]){
          moverX(0);
        }
        if(xyzp[0]<0){
          moverX(1);
        }*/
        retardo2y=r2y;
      }
    }

  }

  if(0<xyzp[2]){
    moverZ(0);
  }
  if(xyzp[2]<0){
    moverZ(1);
  }

  if(0==xyzp[0] && 0==xyzp[1] && 0==xyzp[2]){
    Serial.println("true");
    digitalWrite(pinEstado,LOW);
    comenzar=false;
  }
}else{
  analogWrite(13,10);
}
}// loop








