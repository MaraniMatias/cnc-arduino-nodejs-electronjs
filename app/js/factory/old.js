/*
angular.factory('addLineMessage', ['lineTable', (lineTable) => {
  return (msg,type) => {
    switch(type){
      case 1: type='positive'; break;
      case 2: type='active'; break;
      case 3: type='warning';break;
      case 4: type='negative';break;
      case 5: type='disabled';break;
      default:type='';
    }
    lineTable.push({nro:'',ejes:[],type,code:msg,steps:[]});
  };
}])
*/
/*
angular.factory('addMessage', ['ipc',(ipc) =>  {
  return (msg,title,header,type) => {
    switch(type){
      case 1: type='info';break;
      case 2: type='error';break;
      case 3: type='warning';break;
      case 4: type='question';break;
      case 5: type='none';break;
      default:type='none';
    }
    ipc.send('message', { type,title,header,msg });
  };
}])
*/