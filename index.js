var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
     res.sendFile(__dirname + '/public/index.html');
});

let d6 = () => Math.ceil(Math.random() * 6);
let roll = () => new Array(3).fill(null).map(d6);

let stunted = (arr) => arr[0] === arr [1] || arr[1] === arr[2];
let stuntPoints = (arr) => stunted(arr) ? arr[2] : 0;
let sum = (a,b) => parseInt(a) + parseInt(b);
let diceSum = (dice) => dice.reduce(sum);

let history = [];

let gen = (user) => {
    let dice = roll();
    let res = {
        eventType: 'roll',
        eventInfo: {
            user: user,
            dice: dice,
            stunt: stunted(dice),
            stuntPoints: stuntPoints(dice),
            sum: diceSum(dice)
        }
    };

    return res;
};

io.on('connection', function(socket) {
    socket.on('register', function(msg) {
        console.log('registered');
        io.emit('register', history);
    });

    socket.on('roll', function(msg) {
        let res = gen(msg.username);
        if (history.length > 20) {
            history.shift();
        };
        history.push(res);
        console.log(history);
        io.emit('roll', res);
    });
});


http.listen(3000);
console.log('listening on *:3000');
