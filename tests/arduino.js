/*jslint node: true */
/*global describe, it */
var chai = require('chai');

// install en ./app -> configed for electronjs
var serialPort = require('serialport');
var comName = "", port = {};

describe('Arduino Test', function () {

  it('Looking Arduino connected', function (done) {
    serialPort.list(function (err, ports) {
      var foundPort = false;
      ports.forEach(function (port) {
        if (port.pnpId !== undefined && port.manufacturer !== undefined) {
          foundPort = true;
          comName = port.comName;
          console.log("\tcomName", port.comName);
        }
      });
      chai.assert.isTrue(foundPort);
      done();
    });
  });

  it('Create Port', function (done) {
    port = new serialPort(comName, {
      parser: serialPort.parsers.readline("\r\n"),
      dataBits: 8, baudrate: 115200, parity: 'none',
      stopBits: 1, flowControl: true, autoOpen: true
    }, done());
  });

  it('Open Port', function (done) {
    port.open(function (err) {
      if (err) {
        if (process.platform == 'unix') {
          console.log("sudo chmod 0777 " + comName + "\nError opening port: ", err.message);
        } else {
          console.log("root/administrador - Error opening port: ", err.message);
        }
      }
      port.on('open', done());
      port.close();
    });
  });

  it('Send [1,1,1]', function (done) {
    var data = new Buffer("1,1,1\r\n");
    port.open(function (err) {
      port.write(data, function (err) {
        chai.assert.isNull(err);
      });
      port.on('data', function (d) {
        chai.assert.equal("0,0,0", d.toString(), 'incorrect data received');
        port.close();
      });
      port.on('error', function (err) {
        chai.assert.fail(util.inspect(err));
      });
      port.on('close', function (err) { done() });
    });
  });

  it.skip("Send 'v'", function (done) { });

  it.skip("Send '0,0,0,f'", function (done) { });

  it.skip('Pause and Restart', function (done) { });

});