/*
  Author: Marani Matias Ezequiel
  Email: maranimatias@gmail.com
*/
const int pin[] = {8,9,10,11}; // indicar pines 
const float tiempo = 10; // minimo 5 - 7 

void setup() {
  pinMode(pin[0],OUTPUT);
  pinMode(pin[1],OUTPUT);
  pinMode(pin[2],OUTPUT);
  pinMode(pin[3],OUTPUT);
}

void loop() {
  
//paso(0);paso(1);paso(2);paso(3);

//paso(0);paso(1);paso(3);paso(2);
//paso(2)digitalWrite(pin[i],LOW);;paso(3);paso(1);paso(0); // sentido invertido

//paso(0);paso(2);paso(1);paso(3);
paso(3);paso(1);paso(2);paso(0);

//paso(0);paso(3);paso(1);paso(2);

}

void paso(int i){
  digitalWrite(pin[i],HIGH);
  delay(tiempo);
  digitalWrite(pin[i],LOW);
  delay(tiempo);
}

// Eje X
// pines 0 1 2 3
// secuencia 0 1 3 2

// Eje Y
// pines 4 5 6 7
// secuencia 4 5 7 6

// Eje Z
// pines 8 9 10 11
// secuencia 8 10 9 11