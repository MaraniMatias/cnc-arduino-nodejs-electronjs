//http = require('http'),
//socketio = require('socket.io'),
//url = require("url"),
var express = require('express.io');
var fs = require('fs');
var app = exports.app = express();
app.http().io();

var pub = __dirname + '/public';

require('./routes');

// setup middleware

app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.listen(3000);
console.log('localhost:3000');

module.exports = app;