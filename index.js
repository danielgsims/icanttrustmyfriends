let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

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
    socket.on('register', function(user) {
        //set the user for this socket
        socket.user = user;

        //broadcast the user joined message
        let msg = { eventType: 'join', eventInfo: user};
        //tell others we've joined
        socket.broadcast.emit('event', msg);

        //add this event to history
        history.push(msg);

        //load history
        socket.emit('event', { eventType: 'load', eventInfo: { history: history } });
    });

    socket.on('roll', function(msg) {
        let res = gen(msg.username);
        if (history.length > 20) {
            history.shift();
        };
        history.push(res);
        io.emit('event', res);
    });

    socket.on('disconnect', function() {
        let msg = { eventType: 'disconnect', eventInfo: socket.user};
        socket.broadcast.emit('event', msg);
    });
});

http.listen(3000);
console.log('listening on *:3000');
