var express = require("express");
var app = express();
var SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline');

// Web server

app.use(express.static('public'));

var port = new SerialPort('/dev/tty.usbmodem141231', {
    baudRate: 9600
})

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

var send = () => {}

parser.on('data', (res) => {
    send(res);
})


var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('connection');

    
    // Saving the previous value
    var prev = '1,1,1,1';
    send = (data) => {
        // Trimming whitespace off the data (newline character)
        data = data.trim();

        // Compare current values to previous. If they're the same return (finish here)
        if(data === prev) return;

        var previousValues = prev.split(',').map(x => Number.parseInt(x));
        var values = data.split(',').map(x => Number.parseInt(x));

        // Find which button was pressed
        var i = values.findIndex((v, i) => {
            return v !== previousValues[i];
        })


        // Send down the socket
        socket.emit('hit', {
            i,
            on: values[i] === 0
        })

        prev = data;
    }
});