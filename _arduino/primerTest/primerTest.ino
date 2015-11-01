const int pinEstado = 13; // ledEstado
const int pinX[] = {0,1,2,3}; // pin de motores
const int pinY[] = {4,5,6,7}; // pin de motores
const int pinZ[] = {8,9,10,11}; // pin de motores
const int btnX=A5,btnY=A4,btnZ=A3;

bool bEstado = true,
x=false,y=false,z=false; // usado para indicar estados

int bx,by,bz,// variable para finales de carrera
xyzp[] = {0,0,0}, // cantidad de pasos para cade eje
xp=0,yp=0,zp=0;   // guardar ultimo paso usado
 
//int unavuelta=100;
float tiempo, tiempoInicial = 10.0; // minimo 2.3

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

void loop() {   // 123,346,00; -124,-235,-00 
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
        //Serial.println(xyzp[0]);
        //Serial.println(xyzp[1]);
        //Serial.println(xyzp[2]);
        if(x==false||y==false||z==false){
          comenzar=true;
        }
      }
  }

//llevaraCerro();

if(comenzar){
  int m = 0;
  if(xyzp[0]!=0){m++;}
  if(xyzp[1]!=0){m++;}
  if(xyzp[2]!=0){m++;}
  tiempo = tiempoInicial/m ;
  
  if(0<xyzp[0]){
    xyzp[0]--;moverX(0);estado();
  }
  if(xyzp[0]<0){
    xyzp[0]++;moverX(1);estado();
  }
  
  if(0<xyzp[1]){
    xyzp[1]--;moverY(0);estado();
  }  
  if(xyzp[1]<0){
    xyzp[1]++;moverY(1);estado();
  }  
  
  if(0<xyzp[2]){
    xyzp[2]--;moverZ(0);estado();
  }  
  if(xyzp[2]<0){
    xyzp[2]++;moverZ(1);estado();
  }  
  
  if(0==xyzp[0] && 0==xyzp[1] && 0==xyzp[2]){
    Serial.print("A");
    Serial.print("fin");
    Serial.print("B");
    digitalWrite(pinEstado,LOW);
    comenzar=false;
    m=0;
  }
}

}// loop






