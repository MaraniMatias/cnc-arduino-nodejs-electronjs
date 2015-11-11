#include <math.h>
const int pinEstado = 13; // ledEstado
const int pinX[] = {0,1,2,3}; // pin de motores
const int pinY[] = {4,5,6,7}; // pin de motores
const int pinZ[] = {8,9,10,11}; // pin de motores
const int btnX=A5,btnY=A4,btnZ=A3;

bool bEstado = true,
x=false,y=false,z=false; // usado para indicar estados

int bx,by,bz,// variable para finales de carrera
xyzp[] = {0,0,0}, // cantidad de pasos para cade eje
xp=0,yp=0,zp=0,  // guardar ultimo paso usado
ratardox=0,ratardoy=0,rx=0,ry=0,ratard2x=0,ratard2y=0,r2x=0,r2y=0;//guardar para desvio o angulos distintos a 45

float tiempo = 20;
 
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

void loop() {   // [2784,-1202]
  while(Serial.available()){
    int inChar = Serial.read();
      if(inChar!=','){
        
        //if (inChar == 'o' ) {x=true;y=true;z=true;}
        
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
          double auxX=0,auxY=0;
          auxX=xyzp[0];
          auxY=xyzp[1];
          if(auxX<0){auxX = auxX*-1;}
          if(auxY<0){auxY = auxY*-1;}
          if(auxX<auxY){
            ratardox=floor(auxY / auxX);
            ratard2x = floor(auxY/auxY - auxX*floor(auxY / auxX));
            ratardoy=0;
          }else{
            ratard2y = floor(auxX/auxX - auxY*floor(auxX / auxY));
            ratardoy= floor(auxX / auxY);
            ratardox=0;
          }
          rx=ratardox;
          ry=ratardoy; 
          r2x=ratard2x;
          r2y=ratard2y;         
          comenzar=true;
        }
      }
  }

llevaraCerro();

if(comenzar){
  
  if(ratardox==0){
    if(ratard2x>0){ratard2x--;}
    if(ratardoy>0){ratardoy--;}
    ratardox=rx;
    
    if(0<xyzp[0]){
      moverX(0);
      if(ratard2x==0){
        moverX(0);
        ratard2x=r2x;
      }
      estado();
    }
    if(0>xyzp[0]){
      moverX(1);
      if(ratard2x==0){
        moverX(1);
        ratard2x=r2x;
      }
      estado();
    }
  }

  if(ratardoy==0){
    if(ratard2y>0){ratard2y--;}
    if(ratardox>0){ratardox--;}
    ratardoy=ry;
    
    if(0<xyzp[1]){
      moverY(0);
      if(ratard2y==0){
        moverY(0);
        ratard2y=r2y;
      }
      estado();   
    }  
    if(xyzp[1]<0){
      moverY(1);
      if(ratard2y==0){
        moverY(1);
        ratard2y=r2y;
      }
      estado();
    }  
  }

  if(0<xyzp[2]){
    moverZ(0);
    estado();
  }  
  if(xyzp[2]<0){
    moverZ(1);
    estado();
  }  
  
  if(0==xyzp[0] && 0==xyzp[1] && 0==xyzp[2]){
    Serial.println("true");
    digitalWrite(pinEstado,LOW);
    comenzar=false;
  }
}

}// loop






