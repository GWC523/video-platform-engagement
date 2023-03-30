const path = require('path');
const express = require('express')
const http = require('http')
const moment = require('moment');
const socketio = require('socket.io');
const PORT = process.env.PORT || 3000;



const app = express();
const server = http.createServer(app);


const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {};
let socketroom = {};
let socketname = {};
let micSocket = {};
let videoSocket = {};
let happySocket = {};
let sadSocket = {};
let thumbsUpSocket = {};
let thumbsDownSocket = {};
let nodSocket = {};
let shakeSocket = {};
let roomBoard = {};

io.on('connect', socket => {

    socket.on("join room", (roomid, username) => {

        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';
        happySocket[socket.id] = 'off';
        sadSocket[socket.id] = 'off';
        thumbsUpSocket[socket.io] = 'off';
        thumbsDownSocket[socket.io] = 'off';
        nodSocket[socket.io] = 'off';
        shakeSocket[socket.io] = 'off';


        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'Bot', moment().format(
                "h:mm a"
            ));
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket, happySocket, sadSocket, thumbsUpSocket, thumbsDownSocket, nodSocket, shakeSocket);
        }
        else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room', null, null, null, null, null, null, null, null, null, null);
        }

        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    socket.on('action', msg => {
        if (msg == 'mute')
            micSocket[socket.id] = 'off';
        else if (msg == 'unmute')
            micSocket[socket.id] = 'on';
        else if (msg == 'happy')
            happySocket[socket.id] = 'on';
        else if (msg == 'unhappy')
            happySocket[socket.id] = 'off';
        else if (msg == 'sad')
            sadSocket[socket.id] = 'on';
        else if (msg == 'unsad')
            sadSocket[socket.id] = 'off';
        else if (msg == 'thumbsup')
            thumbsUpSocket[socket.id] = 'on';
        else if (msg == 'unthumbsup')
            thumbsUpSocket[socket.id] = 'off';
        else if (msg == 'thumbsdown')
            thumbsDownSocket[socket.id] = 'on';
        else if (msg == 'unthumbsdown')
            thumbsDownSocket[socket.id] = 'off';
        else if (msg == 'videoon')
            videoSocket[socket.id] = 'on';
        else if (msg == 'videooff')
            videoSocket[socket.id] = 'off';
        else if (msg == 'nod')
            nodSocket[socket.id] = 'on';
        else if (msg == 'unnod')
            nodSocket[socket.id] = 'off';
        else if (msg == 'shake')
            shakeSocket[socket.id] = 'on';
        else if (msg == 'unshake')
            shakeSocket[socket.id] = 'off';

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
    })

    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketname[socket.id], micSocket[socket.id], videoSocket[socket.id], happySocket[socket.id], sadSocket[socket.id], thumbsUpSocket[socket.id], thumbsDownSocket[socket.id], nodSocket[socket.id], shakeSocket[socket.io]);
    })

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    })

    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    })

    socket.on('message', (msg, username, roomid) => {
        io.to(roomid).emit('message', msg, username, moment().format(
            "h:mm a"
        ));
    })

    socket.on('getCanvas', () => {
        if (roomBoard[socketroom[socket.id]])
            socket.emit('getCanvas', roomBoard[socketroom[socket.id]]);
    });

    socket.on('draw', (newx, newy, prevx, prevy, color, size) => {
        socket.to(socketroom[socket.id]).emit('draw', newx, newy, prevx, prevy, color, size);
    })

    socket.on('clearBoard', () => {
        socket.to(socketroom[socket.id]).emit('clearBoard');
    });

    socket.on('store canvas', url => {
        roomBoard[socketroom[socket.id]] = url;
    })

    socket.on('disconnect', () => {
        if (!socketroom[socket.id]) return;
        socket.to(socketroom[socket.id]).emit('message', `${socketname[socket.id]} left the chat.`, `Bot`, moment().format(
            "h:mm a"
        ));
        socket.to(socketroom[socket.id]).emit('remove peer', socket.id);
        var index = rooms[socketroom[socket.id]].indexOf(socket.id);
        rooms[socketroom[socket.id]].splice(index, 1);
        io.to(socketroom[socket.id]).emit('user count', rooms[socketroom[socket.id]].length);
        delete socketroom[socket.id];
        // console.log('--------------------');
        // console.log(rooms[socketroom[socket.id]]);

        //toDo: push socket.id out of rooms
    });
})


server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));