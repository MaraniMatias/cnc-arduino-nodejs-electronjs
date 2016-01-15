/*jslint node: true */
/*global describe, it */
var chai = require('chai');
var util = require('util');
var serialPort = require('serialport');

describe ('Arduino Test', function() {

  describe('General', function() {
    it('Looking Arduino connected', function (done) {
      serialPort.list(function(err, ports) {
        
        chai.assert.isUndefined(err, util.inspect(err));
        chai.assert.isDefined(ports, 'ports is not defined');
        chai.assert.isTrue(ports.length > 0, 'no ports found');
        
        done();
      });
    })
    it('Send [0,0,0]', function (done) {
      serialPort.list(function(err, ports) {
        var data = new Buffer('[0,0,0]\n');

        var port = new serialPort.SerialPort(ports.slice(-1)[0].comName, null, false);
        port.on('error', function(err) {
          chai.assert.fail(util.inspect(err));
        });

        port.on('data', function(d) {
          chai.assert.equal(0, d, 'incorrect data received');
          port.close(function(err) {
            chai.assert.isUndefined(err, util.inspect(err));
            done();
          });
        });

        port.open(function(err) {
          chai.assert.isUndefined(err, util.inspect(err));
          port.write(data);
        });
        
      });
    })
    
    it.skip("Send 's'", function (done) {

    })
    
    it.skip("Send 'o'", function (done) {

    })
    
    it.skip("Send 'f'", function (done) {

    })
    
    it.skip('Pause and Restart', function (done) {

    })

  })
})