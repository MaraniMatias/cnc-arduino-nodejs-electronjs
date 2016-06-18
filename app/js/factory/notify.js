angular.factory('notify', ['statusBar', (statusBar) => {
  return (message,type) => {
    statusBar.message = message;
    statusBar.type = type;
    //tatusBar.time = time?time:1000;
  };
}])
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
/*
angular.factory('notify', [ () => {
  return (message,status,pos) => {
    // status = (status===undefined)? 'info': status;
    // 'success' 'warning' 'danger' 'info'
    timeout = (status==='danger')? 0:5000;
    if(status==='error') status = 'danger';
    switch(pos){
      case 1: pos='top-left'; break;
      case 2: pos='top-center'; break;
      case 3: pos='top-right';break;
      case 4: pos='bottom-left'; break;
      case 5: pos='bottom-center'; break;
      case 6: pos='bottom-right'; break;
      default: pos='top-center';
    }
    UIkit.notify({ message , status , pos , timeout });
  };
}])
*/