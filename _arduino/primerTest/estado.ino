void estado(){
  if(bEstado){
    digitalWrite(pinEstado,HIGH);
  }else{
    digitalWrite(pinEstado,LOW);
  }
  bEstado = !bEstado;
}
