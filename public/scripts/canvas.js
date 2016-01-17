var c = document.getElementById("myCanvas");
c.width  = 600;
c.height = 600;
var ctx = c.getContext("2d");
ctx.width  = c.width;
ctx.height = c.height;
var cx=ctx.width/2;
var cy=ctx.height/2;

ctx.lineWidth = 1;
ctx.strokeStyle = 'black';

io.emit('connection');
io.on('canvas', function (data) {  
  ctx.lineTo(
    cx+data.x*3
    ,
    cy+data.y*3
  );
  if(data.end){
    ctx.stroke();
    ctx.save();
  }
  if(data.cleaner){
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.save();
    ctx.moveTo(cx,cy);
  }
});
