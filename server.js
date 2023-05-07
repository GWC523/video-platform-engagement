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
let attendees = [];
let hostId = '';

//Instances tracker
let numNod = 0;
let numHappy = 0;
let numSad = 0;
let numThumbsUp = 0;
let numThumbsDown = 0;
let numShake = 0;
let isHappy = {};
let isSad = {};
let isThumbsUp = {};
let isThumbsDown = {};
let startInterval = false;



io.on('connect', socket => {

    socket.on("join room", (roomid, username, isHost) => {

        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';
        happySocket[socket.id] = 'off';
        sadSocket[socket.id] = 'off';
        thumbsUpSocket[socket.id] = 'off';
        thumbsDownSocket[socket.id] = 'off';
        nodSocket[socket.io] = 'off';
        shakeSocket[socket.io] = 'off';



        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            
            if(isHost) {
                hostId = socket.id;
            }

            socket.to(roomid).emit('message', `${username} joined the room.`, 'Bot', moment().format(
                "h:mm a"
            ));
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket, happySocket, sadSocket, thumbsUpSocket, thumbsDownSocket, nodSocket, shakeSocket, hostId);
        }
        else {
            rooms[roomid] = [socket.id];

            if(isHost) {
                attendees.length = 0;
                hostId = socket.id;
            }

            io.to(socket.id).emit('join room', null, null, null, null, null, null, null, null, null, null, null);
        }

        attendees.push(username);
        io.emit('update attendees', attendees);

        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    socket.on('action', (msg, host) => {

        if (msg == 'mute') {
            micSocket[socket.id] = 'off';
        } else if (msg == 'unmute') {
            micSocket[socket.id] = 'on';
        } else if (msg == 'happyon') {
            if(!isHappy[socket.id] && startInterval && !host ) {
                isHappy[socket.id] = true;
                numHappy += 1;
                io.emit('update num happy', numHappy); // emit updated num nods to all clients
            }
            happySocket[socket.id] = 'on';
        } else if (msg == 'happyoff') {
            isHappy[socket.id] = false;
            happySocket[socket.id] = 'off';
        } else if (msg == 'sadon') {
            if(!isSad[socket.id] && startInterval && !host) {
                isSad[socket.id] = true;
                numSad += 1;
                io.emit('update num sad', numSad);
            }
            sadSocket[socket.id] = 'on';
        } else if (msg == 'sadoff') {
            isSad[socket.id] = false;
            sadSocket[socket.id] = 'off';
        } else if (msg == 'thumbsup') {
            if(!isThumbsUp[socket.id] && startInterval && !host) {
                isThumbsUp[socket.id] = true;
                numThumbsUp += 1;
                io.emit('update num thumbsup', numThumbsUp);
            }
            thumbsUpSocket[socket.id] = 'on';
        } else if (msg == 'unthumbsup') {
            isThumbsUp[socket.id] = false;
            thumbsUpSocket[socket.id] = 'off';
        } else if (msg == 'thumbsdown') {
            if(!isThumbsDown[socket.id] && startInterval && !host) {
                isThumbsDown[socket.id] = true;
                numThumbsDown += 1;
                io.emit('update num thumbsdown', numThumbsDown);
            }

            thumbsDownSocket[socket.id] = 'on';
        } else if (msg == 'unthumbsdown') {
            isThumbsDown[socket.id] = false;
            thumbsDownSocket[socket.id] = 'off';
        } else if (msg == 'videoon') {
            videoSocket[socket.id] = 'on';
        } else if (msg == 'videooff') {
            videoSocket[socket.id] = 'off';
        } else if (msg == 'nod') {
        // Example ni sya saun pag increment sa number of nods, you can do the same for other actions
            if(!host) {
                numNod += 1;
                io.emit('update num nod', numNod); // emit updated num nods to all clients
                nodSocket[socket.id] = 'on'; // notice on sya, mu increment ra if ang message sa socket kay on 
            }
        } else if (msg == 'unnod') {
            nodSocket[socket.id] = 'off';
        } else if (msg == 'shake') {
            if(!host) {
                numShake += 1;
                io.emit('update num shake', numShake);
                shakeSocket[socket.id] = 'on';
            }   
        } else if (msg == 'unshake') {
            shakeSocket[socket.id] = 'off';
        } else if (msg == 'startinterval') {
            startInterval = true;
        } else if (msg == 'cancelinterval') {
            startInterval = false;
            numNod = 0;
            numHappy = 0;
            numSad = 0;
            numShake = 0;
            numThumbsDown = 0;
            numThumbsUp = 0;
            io.emit('update num happy', numHappy);
            io.emit('update num sad', numSad);
            io.emit('update num thumbsup', numThumbsUp);
            io.emit('update num thumbsdown', numThumbsDown);
            io.emit('update num nod', numNod);
            io.emit('update num shake', numShake);
        } else if (msg == 'restartCount') {
            numNod = 0;
            numHappy = 0;
            numSad = 0;
            numShake = 0;
            numThumbsDown = 0;
            numThumbsUp = 0;
            io.emit('update num happy', numHappy);
            io.emit('update num sad', numSad);
            io.emit('update num thumbsup', numThumbsUp);
            io.emit('update num thumbsdown', numThumbsDown);
            io.emit('update num nod', numNod);
            io.emit('update num shake', numShake);
        } else if (msg =='refresh attendees') {
            attendees.length = 0;
        }

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
        // console.log("num nod:", numNodSocket)
    })
    

      
    /** Make a function here na mu refresh ang number of nods and etc to
     * 0 once mu hit sa chosen time interval sa user. You can apply a time interval function to do that
     * You can also make a different socket for the time interval, that will store the chosen
     * time interval of the user. In the room.js you just have to use  socket.emit('action', '') functions.
     * 
     * Example: 
     * socket.emit('action', '1 min') //use if na detect na ang gi click na radio button kay 1 min
     * socket.emit('action', '5 min') //use if na detect na ang gi click na radio button kay 5 min
     * 
     * Add dayun an if else statement inside line 67 function to update a local variable continang the chosen time interval na e use nimo para sa time interval funtion 
     * Add also another socket for storing the num of instances (nod and etc) ex: numNodSocket[socket.id] = numNod and use that in your room.js to append the number of nods
     * 
     * Know more about sockets here:
     * https://socket.io/docs/v4/
     * https://www.youtube.com/watch?v=1BfCnjr_Vjg
     * 
     */

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
        delete attendees[socket.id];
        // attendees.remove(socketname[socket.id]);
        // io.emit('update attendees', attendees);
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
        socket.broadcast.emit('attendee left', socket.id);
        //toDo: push socket.id out of rooms
    });
})


server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));