angular.service('upload', ['ipc','cnc',"$http", "$q", (ipc,cnc,$http, $q) => { 
  this.comando = (code,type) => {
    if(code !== null){
      if( ipc.sendSync('send-command',{ code , type}) ){
        cnc.working = true;
        cnc.file.line.interpreted = 0;
      }else{
        // mensaje de error
      }
    }
  }
  
  this.comenzar = function(){
    var deferred = $q.defer();
    return $http.post("/comenzar", {
        nro   : cnc.file.line.interpreted,
        steps : cnc.pause.steps[0]+','+cnc.pause.steps[1]+','+cnc.pause.steps[2]
    })
    .success(function(res){
      if(!res){
        //addLineMessage("algo salio mal :(",4);
      }else{
        cnc.working = true;
        cnc.file.line.interpreted = 0;
      }
      deferred.resolve(res);
    })
    .error(function(msg, code){
      deferred.reject(msg);
    })
    //addLineMessage(deferred.promise,4);
  }
}]);