var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.lineWidth = 1;
ctx.strokeStyle = 'black';
ctx.width  = 600;
ctx.height = 600;

//ctx.translate(300,300);
//ctx.scale(2,2);


io.emit('connection');
io.on('canvas', function (data) {  
  ctx.lineTo(
    300+data.x
    ,
    300+data.y
  );
  if(data.end){ctx.stroke();}
  if(data.cleaner){
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.moveTo(300,300);
  }
});
