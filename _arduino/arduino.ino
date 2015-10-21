const int ledEstado = 13;
void setup() {
  pinMode(ledEstado,OUTPUT);// LED inicador
}

void loop() {
  digitalWrite(ledEstado,LOW);
  delay(500);
  digitalWrite(ledEstado,HIGH);
  delay(500);
}
