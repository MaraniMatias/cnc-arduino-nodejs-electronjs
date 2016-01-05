#include <math.h>
// seting:START
const bool debug = false;          // debug
const int pinEstado = 13;          // ledEstado
const int pinX[] = {2,3,1,0};      // pin de motores
const int pinY[] = {4,5,6,7};      // pin de motores
const int pinZ[] = {8,9,10,11};    // pin de motores
const int btnX=A5,btnY=A4,btnZ=A3; // finales de carrera
const float tiempo = 25;                 // tiempo entre paso
// seting:END

bool bEstado = true,     // para indicar estados
x=false,y=false,z=false; // para indicar cuando esta en 0,0,0

int bx,by,bz,     // variable para finales de carrera
xyzp[] = {0,0,0}, // cantidad de pasos para cada eje
xp=0,yp=0,zp=0,   // guardar ultimo paso usado
retardox=0,retardoy=0,rx=0,ry=0,
agregarCadaX=0,agregarCadaY=0,addX=0,addY=0; //guardar para desvio o angulos distintos a 45

int i=0, inChar=0; String inString = "";
boolean comenzar = false;

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
  
  if(comenzar){

    if(retardox==0){
      retardox=rx;
      retardoy>0?retardoy--:0;
  
      if(0<xyzp[0]){
        moverX(0);
      }
      if(0>xyzp[0]){
        moverX(1);
      }
      
      //Insertar X
      if(agregarCadaX==xyzp[0] && addX!=0){
        if(0<xyzp[0]){
          moverX(0);
          agregarCadaX = xyzp[0] - addX;
        }
        if(0>xyzp[0]){
          moverX(1);
          agregarCadaX = xyzp[0] + addX;
        }
      }//Insertar X
      
      if(ry==0){render();}
    }
  
    if(retardoy==0){
      retardoy=ry;
      retardox>0?retardox--:0;
      
      if(0<xyzp[1]){
        moverY(0);
      }
      if(xyzp[1]<0){
        moverY(1);
      }
      
      //Insertar Y
      if(agregarCadaY==xyzp[1] && addY!=0){
        if(0<xyzp[1]){
          moverY(0);
          agregarCadaY = xyzp[1] - addY;
        }
        if(0>xyzp[1]){
          moverY(1);
          agregarCadaY = xyzp[1] + addY;
        }
      }//Insertar Y
      
      if(rx==0){render();}
    }
  
    if(0<xyzp[2]){
      moverZ(0);
    }
    if(xyzp[2]<0){
      moverZ(1);
    }  
     
    if(xyzp[0]==0 && xyzp[1]==0 && xyzp[2]==0){
      comenzar=false;
      digitalWrite(pinEstado,LOW);
      Serial.println(comenzar); // termine :D  
    }
    else//if(debug)
    {
      Serial.print(xyzp[0]);
      Serial.print(',');
      Serial.print(xyzp[1]);
      Serial.print(',');
      Serial.println(xyzp[2]);
    }
    
  }else{
    analogWrite(13,5);
  }

  while(Serial.available() ){
    int inChar = Serial.read();
    if(inChar!=','){
      //if (inChar == 'o' ) {x=true;y=true;z=true; llevaraCerro();}
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
      i=0;
      inString = "";
      if(x==false||y==false||z==false){
        render();
        comenzar=true;
      }
    }
  }// leer entrada

}// loop

