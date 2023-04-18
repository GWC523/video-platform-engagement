

const socket = io();
const myvideo = document.querySelector("#vd1");
const roomid = params.get("room");
const host = params.get("host");
let username;
const chatRoom = document.querySelector('.chat-cont');
const sendButton = document.querySelector('.chat-send');
const messageField = document.querySelector('.chat-input');
const videoContainer = document.querySelector('#vcont');
const overlayContainer = document.querySelector('#overlay')
const continueButt = document.querySelector('.continue-name');
const nameField = document.querySelector('#name-field');
const videoButt = document.querySelector('.novideo');
const audioButt = document.querySelector('.audio');
const cutCall = document.querySelector('.cutcall');
const screenShareButt = document.querySelector('.screenshare');
const whiteboardButt = document.querySelector('.board-icon');



// console.log(host)


//whiteboard js start
const whiteboardCont = document.querySelector('.whiteboard-cont');
const canvas = document.querySelector("#whiteboard");
const ctx = canvas.getContext('2d');

let boardVisisble = false;

whiteboardCont.style.visibility = 'hidden';

let isDrawing = 0;
let x = 0;
let y = 0;
let color = "black";
let drawsize = 3;
let colorRemote = "black";
let drawsizeRemote = 3;
let numNod = 0;

function fitToContainer(canvas) {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

fitToContainer(canvas);

//getCanvas call is under join room call
socket.on('getCanvas', url => {
    let img = new Image();
    img.onload = start;
    img.src = url;

    function start() {
        ctx.drawImage(img, 0, 0);
    }

    // console.log('got canvas', url)
})

function setColor(newcolor) {
    color = newcolor;
    drawsize = 3;
}

function setEraser() {
    color = "white";
    drawsize = 10;
}

//might remove this
function reportWindowSize() {
    fitToContainer(canvas);
}

window.onresize = reportWindowSize;
//

function clearBoard() {
    if (window.confirm('Are you sure you want to clear board? This cannot be undone')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('store canvas', canvas.toDataURL());
        socket.emit('clearBoard');
    }
    else return;
}

socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

function draw(newx, newy, oldx, oldy) {
    ctx.strokeStyle = color;
    ctx.lineWidth = drawsize;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();

    socket.emit('store canvas', canvas.toDataURL());

}

function drawRemote(newx, newy, oldx, oldy) {
    ctx.strokeStyle = colorRemote;
    ctx.lineWidth = drawsizeRemote;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();

}

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = 1;
})

canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        draw(e.offsetX, e.offsetY, x, y);
        socket.emit('draw', e.offsetX, e.offsetY, x, y, color, drawsize);
        x = e.offsetX;
        y = e.offsetY;
    }
})

window.addEventListener('mouseup', e => {
    if (isDrawing) {
        isDrawing = 0;
    }
})

socket.on('draw', (newX, newY, prevX, prevY, color, size) => {
    colorRemote = color;
    drawsizeRemote = size;
    drawRemote(newX, newY, prevX, prevY);
})

//whiteboard js end

let videoAllowed = 1;
let audioAllowed = 1;
let happyAllowed = 1;
let sadAllowed = 1;
let thumbsUpAllowed = 1;
let thumbsDownAllowed = 1;
let micInfo = {};
let videoInfo = {};
let happyInfo = {};
let sadInfo = {};
let thumbsUpInfo = {};
let thumbsDownInfo = {};
let nodInfo = {};
let shakeInfo = {};
let attendees = {};

let videoTrackReceived = {};

let mymuteicon = document.querySelector("#mymuteicon");
mymuteicon.style.visibility = 'hidden';

let myvideooff = document.querySelector("#myvideooff");
myvideooff.style.visibility = 'hidden';

let myhappyicon = document.querySelector("#myhappyicon");
myhappyicon.style.visibility = 'hidden';

let mysadicon = document.querySelector("#mysadicon");
mysadicon.style.visibility = 'hidden';

let mythumbsupicon = document.querySelector("#mythumbsupicon");
mythumbsupicon.style.visibility = 'hidden';

let mythumbsdownicon = document.querySelector("#mythumbsdownicon");
mythumbsdownicon.style.visibility = 'hidden';

let mynodicon = document.querySelector("#mynodicon");
mynodicon.style.visibility = 'hidden';

let myshakeicon = document.querySelector("#myshakeicon");
myshakeicon.style.visibility = 'hidden';

let myvideoicon = document.querySelector(".novideo");

let startIntervalButton = document.getElementById('start-interval');
let cancelIntervalButton = document.getElementById('cancel-interval');

let attendeesBar = document.querySelector('.attendies');
let attendeesList = document.querySelector('#attendeeList');
let chatCont = document.querySelector('.chat-input-cont');
let chatBar = document.querySelector('.chats');
let stat = document.querySelector('.stats-cont');
let statBar = document.querySelector('.stats');
stat.style.visibility = 'hidden';
attendeesList.style.display = 'none';


if(!host) {
    console.log("not host")
    myvideoicon.style.display = 'none';
    statBar.style.display = 'none';

} else {
    myvideoicon.style.display = 'visibile';
}


const configuration = { iceServers: [{ urls: "stun:stun.stunprotocol.org" }] }

const mediaConstraints = { video: true, audio: true };

let connections = {};
let cName = {};
let audioTrackSent = {};
let videoTrackSent = {};

let mystream, myscreenshare;


document.querySelector('.roomcode').innerHTML = `${roomid}`

function CopyClassText() {

    var textToCopy = document.querySelector('.roomcode');
    var currentRange;
    if (document.getSelection().rangeCount > 0) {
        currentRange = document.getSelection().getRangeAt(0);
        window.getSelection().removeRange(currentRange);
    }
    else {
        currentRange = false;
    }

    var CopyRange = document.createRange();
    CopyRange.selectNode(textToCopy);
    window.getSelection().addRange(CopyRange);
    document.execCommand("copy");

    window.getSelection().removeRange(CopyRange);

    if (currentRange) {
        window.getSelection().addRange(currentRange);
    }

    document.querySelector(".copycode-button").textContent = "Copied!"
    setTimeout(()=>{
        document.querySelector(".copycode-button").textContent = "Copy Code";
    }, 5000);
}


continueButt.addEventListener('click', () => {
    if (nameField.value == '') return;
    username = nameField.value;
    overlayContainer.style.visibility = 'hidden';
    document.querySelector("#myname").innerHTML = `${username} (You)`;
    if(host) {
        document.querySelector("#myname").innerHTML = `${username} (Host-You)`;
    } else {
       myvideo.style.visibility = 'hidden';
    }
    socket.emit("join room", roomid, username, host);

})

nameField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        continueButt.click();
    }
});

socket.on('user count', count => {
    if (count > 1) {
        videoContainer.className = 'video-cont';
    }
    else {
        videoContainer.className = 'video-cont-single';
    }
})

let peerConnection;

function handleGetUserMediaError(e) {
    switch (e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }

}


function reportError(e) {
    console.log(e);
    return;
}


function startCall() {

    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(localStream => {
            myvideo.srcObject = localStream;
            myvideo.muted = true;

            localStream.getTracks().forEach(track => {
                for (let key in connections) {
                    connections[key].addTrack(track, localStream);
                    if (track.kind === 'audio')
                        audioTrackSent[key] = track;
                    else
                        videoTrackSent[key] = track;
                }
            })

        })
        .catch(handleGetUserMediaError);


}

function startNodDetect() {
    navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.play();
    
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    let intervalId;
    
    mediaRecorder.ondataavailable = e => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = e => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('video_frame', blob, 'recording.mp4');
      console.log("sending video")
      fetch('http://127.0.0.1:8000/detectHeadGesture/', {
        method: 'POST',
        body: formData
      })
      .then((response)=> response.json())
      .then((data) => {
        
    
        

        if(data.gesture == "nodding") {
            if(host) {
                numNod += 1; 
                mynodicon.style.visibility = 'visible';
                myshakeicon.style.visibility = 'hidden';
            }
            socket.emit('action', 'nod');
            socket.emit('action', 'unshake');
        }
        else if(data.gesture == "turning") {
            console.log("turning");
            if(host) {
                myshakeicon.style.visibility = 'visible';
                mynodicon.style.visibility = 'hidden';
            }
            socket.emit('action', 'unnod');
            socket.emit('action', 'shake');
        } 
        else {
            console.log("stationary");
            if(host) {
                myshakeicon.style.visibility = 'hidden';
                mynodicon.style.visibility = 'hidden';
            }
            socket.emit('action', 'unnod');
            socket.emit('action', 'unshake');
        }

    
      })
      .catch(error => console.error(error));
      
      chunks.length = 0;
    };
    
    mediaRecorder.start();
    intervalId = setInterval(() => {
      console.log("looping record")
      mediaRecorder.stop();
      mediaRecorder.start();
    }, 1800);
  })
  .catch(error => console.error(error));

}

//Check this function out
function handleVideoOffer(offer, sid, cname, micinf, vidinf, happyinf, sadinf, thumbsupinf, thumbsdowninf, nodinf, shakeinf, hostId) {
    // console.log("handleVideoOffer:" + happyinf)
    cName[sid] = cname;
    // console.log('video offered recevied');
    micInfo[sid] = micinf;
    happyInfo[sid] = happyinf;
    sadInfo[sid] = sadinf;
    thumbsUpInfo[sid] = thumbsupinf;
    thumbsDownInfo[sid] = thumbsdowninf;
    nodInfo[sid] = nodinf;
    shakeInfo[sid] = shakeinf
    videoInfo[sid] = vidinf;
    connections[sid] = new RTCPeerConnection(configuration);

    connections[sid].onicecandidate = function (event) {
        if (event.candidate) {
            console.log('icecandidate fired');
            socket.emit('new icecandidate', event.candidate, sid);
        }
    };

    connections[sid].ontrack = function (event) {

        if (!document.getElementById(sid)) {
            console.log('track event fired')
            let vidCont = document.createElement('div');
            let newvideo = document.createElement('video');
            let name = document.createElement('div');
            let muteIcon = document.createElement('div');
            let happyIcon = document.createElement('div');
            let sadIcon = document.createElement('div');
            let thumbsUpIcon = document.createElement('div');
            let thumbsDownIcon = document.createElement('div');
            let videoOff = document.createElement('div');
            let nodIcon = document.createElement('div');
            let shakeIcon = document.createElement('div');
            videoOff.classList.add('video-off');
            muteIcon.classList.add('mute-icon');
            happyIcon.classList.add('happy-icon');
            sadIcon.classList.add('sad-icon');
            thumbsUpIcon.classList.add('thumbs-up-icon');
            thumbsDownIcon.classList.add('thumbs-down-icon');
            nodIcon.classList.add('nod-icon');
            shakeIcon.classList.add('shake-icon');
            name.classList.add('nametag');
            if(hostId == sid) {
                name.innerHTML = `${cName[sid]} (Host)`;
            } else {
                name.innerHTML = `${cName[sid]}`;
            }
            vidCont.id = sid;
            muteIcon.id = `mute${sid}`;
            happyIcon.id = `happy-icon${sid}`;
            sadIcon.id = `sad-icon${sid}`;
            thumbsUpIcon.id = `thumbs-up-icon${sid}`;
            thumbsDownIcon.id = `thumbs-down-icon${sid}`;
            nodIcon.id = `nod-icon${sid}`;
            shakeIcon.id = `shake-icon${sid}`;
            videoOff.id = `vidoff${sid}`;
            muteIcon.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
            happyIcon.innerHTML = `<img src="/Img/smile.png" alt="smile">`;
            sadIcon.innerHTML = `<img src="/Img/frown.png" alt="frown">`;
            nodIcon.innerHTML = `<img src="/Img/nod.png" alt="nod">`;
            shakeIcon.innerHTML = `<img src="/Img/shake.png" alt="nod">`;
            thumbsUpIcon.innerHTML = `<img src="/Img/thumbsUp.png" alt="thumbsUp">`;
            thumbsDownIcon.innerHTML = `<img src="/Img/thumbsDown.png" alt="thumbsDown">`;
            videoOff.innerHTML = 'Video Off'
            vidCont.classList.add('video-box');
            newvideo.classList.add('video-frame');
            newvideo.autoplay = true;
            newvideo.playsinline = true;
            newvideo.id = `video${sid}`;
            console.log(sid)
            console.log(hostId)
            if(hostId == sid) {
                newvideo.style.visibility = 'visible';
            } else {
                newvideo.style.visibility = 'hidden';
            }       
            newvideo.srcObject = event.streams[0];

            if (micInfo[sid] == 'on')
                muteIcon.style.visibility = 'hidden';
            else
                muteIcon.style.visibility = 'visible';

            if (host) {
                if (happyInfo[sid] == 'off') {
                    happyIcon.style.visibility = 'hidden';
                }
                else {
                    happyIcon.style.visibility = 'visible';
                }

                if (sadInfo[sid] == 'off') {
                    sadIcon.style.visibility = 'hidden';
                }
                else {
                    sadIcon.style.visibility = 'visible';
                }

                if (thumbsUpInfo[sid] == 'off') {
                    thumbsUpIcon.style.visibility = 'hidden';
                }
                else {
                    thumbsUpIcon.style.visibility = 'visible';
                }

                if (thumbsDownInfo[sid] == 'off') {
                    thumbsDownIcon.style.visibility = 'hidden';
                }
                else {
                    thumbsDownIcon.style.visibility = 'visible';
                }

                if (nodInfo[sid] == 'off') {
                    nodIcon.style.visibility = 'hidden';
                }
                else {
                    numNod += 1;
                    nodIcon.style.visibility = 'visible';
                }

                if (shakeInfo[sid] == 'off') {
                    shakeIcon.style.visibility = 'hidden';
                }
                else {
                    shakeIcon.style.visibility = 'visible';
                }


                vidCont.appendChild(happyIcon);
                vidCont.appendChild(sadIcon);
                vidCont.appendChild(thumbsUpIcon);
                vidCont.appendChild(thumbsDownIcon);
                vidCont.appendChild(nodIcon);
                vidCont.appendChild(shakeIcon);
            }

            if (videoInfo[sid] == 'on')
                videoOff.style.visibility = 'hidden';
            else
                videoOff.style.visibility = 'visible';

            vidCont.appendChild(newvideo);
            vidCont.appendChild(name);
            vidCont.appendChild(muteIcon);
            vidCont.appendChild(videoOff);

            videoContainer.appendChild(vidCont);

        }


    };

    connections[sid].onremovetrack = function (event) {
        if (document.getElementById(sid)) {
            document.getElementById(sid).remove();
            console.log('removed a track');
        }
    };

    connections[sid].onnegotiationneeded = function () {

        connections[sid].createOffer()
            .then(function (offer) {
                return connections[sid].setLocalDescription(offer);
            })
            .then(function () {

                socket.emit('video-offer', connections[sid].localDescription, sid);

            })
            .catch(reportError);
    };

    let desc = new RTCSessionDescription(offer);

    connections[sid].setRemoteDescription(desc)
        .then(() => { return navigator.mediaDevices.getUserMedia(mediaConstraints) })
        .then((localStream) => {

            localStream.getTracks().forEach(track => {
                connections[sid].addTrack(track, localStream);
                console.log('added local stream to peer')
                if (track.kind === 'audio') {
                    audioTrackSent[sid] = track;
                    if (!audioAllowed)
                        audioTrackSent[sid].enabled = false;
                }
                else {
                    videoTrackSent[sid] = track;
                    if (!videoAllowed)
                        videoTrackSent[sid].enabled = false
                }
            })

        })
        .then(() => {
            return connections[sid].createAnswer();
        })
        .then(answer => {
            return connections[sid].setLocalDescription(answer);
        })
        .then(() => {
            socket.emit('video-answer', connections[sid].localDescription, sid);
        })
        .catch(handleGetUserMediaError);


}

function handleNewIceCandidate(candidate, sid) {
    console.log('new candidate recieved')
    var newcandidate = new RTCIceCandidate(candidate);

    connections[sid].addIceCandidate(newcandidate)
        .catch(reportError);
}

function handleVideoAnswer(answer, sid) {
    console.log('answered the offer')
    const ans = new RTCSessionDescription(answer);
    connections[sid].setRemoteDescription(ans);
}

//Thanks to (https://github.com/miroslavpejic85) for ScreenShare Code

screenShareButt.addEventListener('click', () => {
    screenShareToggle();
});
let screenshareEnabled = false;
function screenShareToggle() {
    let screenMediaPromise;
    if (!screenshareEnabled) {
        if (navigator.getDisplayMedia) {
            screenMediaPromise = navigator.getDisplayMedia({ video: true });
        } else if (navigator.mediaDevices.getDisplayMedia) {
            screenMediaPromise = navigator.mediaDevices.getDisplayMedia({ video: true });
        } else {
            screenMediaPromise = navigator.mediaDevices.getUserMedia({
                video: { mediaSource: "screen" },
            });
        }
    } else {
        screenMediaPromise = navigator.mediaDevices.getUserMedia({ video: true });
    }
    screenMediaPromise
        .then((myscreenshare) => {
            screenshareEnabled = !screenshareEnabled;
            for (let key in connections) {
                const sender = connections[key]
                    .getSenders()
                    .find((s) => (s.track ? s.track.kind === "video" : false));
                sender.replaceTrack(myscreenshare.getVideoTracks()[0]);
            }
            myscreenshare.getVideoTracks()[0].enabled = true;
            const newStream = new MediaStream([
                myscreenshare.getVideoTracks()[0], 
            ]);
            myvideo.srcObject = newStream;
            myvideo.muted = true;
            mystream = newStream;
            screenShareButt.innerHTML = (screenshareEnabled 
                ? `<i class="fas fa-desktop"></i><span class="tooltiptext">Stop Share Screen</span>`
                : `<i class="fas fa-desktop"></i><span class="tooltiptext">Share Screen</span>`
            );
            myscreenshare.getVideoTracks()[0].onended = function() {
                if (screenshareEnabled) screenShareToggle();
            };
        })
        .catch((e) => {
            alert("Unable to share screen:" + e.message);
            console.error(e);
        });
}

socket.on('video-offer', handleVideoOffer);

socket.on('new icecandidate', handleNewIceCandidate);

socket.on('video-answer', handleVideoAnswer);

socket.on('update num nod', (numNod) => {
    document.getElementById('numNod').innerHTML = numNod;
});

socket.on('update num happy', (numHappy) => {
    document.getElementById('numHappy').innerHTML = numHappy;
});

socket.on('update num sad', (numSad) => {
    document.getElementById('numSad').innerHTML = numSad;
});

socket.on('update num thumbsup', (numThumbsUp) => {
    document.getElementById('numThumbsUp').innerHTML = numThumbsUp;
});

socket.on('update num thumbsdown', (numThumbsDown) => {
    document.getElementById('numThumbsDown').innerHTML = numThumbsDown;
});

socket.on('update num shake', (numShake) => {
    document.getElementById('numShake').innerHTML = numShake;
});

//Check this function out
socket.on('join room', async (conc, cnames, micinfo, videoinfo, happyinfo, sadinfo, thumbsupinfo, thumbsdowninfo, nodinfo, shakeinfo, hostId) => {
    socket.emit('getCanvas');
    console.log(happyInfo)
    if (cnames)
        cName = cnames;

    if (micinfo)
        micInfo = micinfo;

    if (videoinfo)
        videoInfo = videoinfo;
    
    if (happyinfo)
        happyInfo = happyinfo;
    
    if (sadinfo)
        sadInfo = sadinfo;

    if (thumbsupinfo)
        thumbsUpInfo = thumbsupinfo;

    if (thumbsdowninfo)
        thumbsDownInfo = thumbsdowninfo;

    if (nodinfo)
        nodInfo = nodinfo;

    if (shakeinfo)
        shakeInfo = shakeinfo;


    console.log(cName);
    if (conc) {
        await conc.forEach(sid => {
            connections[sid] = new RTCPeerConnection(configuration);

            connections[sid].onicecandidate = function (event) {
                if (event.candidate) {
                    console.log('icecandidate fired');
                    socket.emit('new icecandidate', event.candidate, sid);
                }
            };

            connections[sid].ontrack = function (event) {

                if (!document.getElementById(sid)) {
                    console.log('track event fired')
                    let vidCont = document.createElement('div');
                    let newvideo = document.createElement('video');
                    let name = document.createElement('div');
                    let muteIcon = document.createElement('div');
                    let happyIcon = document.createElement('div');
                    let sadIcon = document.createElement('div');
                    let nodIcon = document.createElement('div');
                    let shakeIcon = document.createElement('div');
                    let thumbsUpIcon = document.createElement('div');
                    let thumbsDownIcon = document.createElement('div');
                    let videoOff = document.createElement('div');
                    videoOff.classList.add('video-off');
                    muteIcon.classList.add('mute-icon');
                    happyIcon.classList.add('happy-icon');
                    sadIcon.classList.add('sad-icon');
                    thumbsUpIcon.classList.add('thumbs-up-icon');
                    thumbsDownIcon.classList.add('thumbs-down-icon');
                    nodIcon.classList.add('nod-icon');
                    shakeIcon.classList.add('shake-icon');
                    name.classList.add('nametag');
                    if(hostId == sid) {
                        name.innerHTML = `${cName[sid]} (Host)`;
                    } else {
                        name.innerHTML = `${cName[sid]}`;
                    }
                    vidCont.id = sid;
                    muteIcon.id = `mute${sid}`;
                    happyIcon.id = `happy-icon${sid}`;
                    sadIcon.id = `sad-icon${sid}`;
                    nodIcon.id = `nod-icon${sid}`;
                    shakeIcon.id = `shake-icon${sid}`;
                    videoOff.id = `vidoff${sid}`;
                    thumbsUpIcon.id = `thumbs-up-icon${sid}`;
                    thumbsDownIcon.id = `thumbs-down-icon${sid}`;
                    muteIcon.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                    happyIcon.innerHTML = `<img src="/Img/smile.png" alt="smile">`;
                    sadIcon.innerHTML = `<img src="/Img/frown.png" alt="frown">`;
                    thumbsUpIcon.innerHTML = `<img src="/Img/thumbsUp.png" alt="thumbsUp">`;
                    thumbsDownIcon.innerHTML = `<img src="/Img/thumbsDown.png" alt="thumbsDown">`;
                    nodIcon.innerHTML = `<img src="/Img/nod.png" alt="nod">`;
                    shakeIcon.innerHTML = `<img src="/Img/shake.png" alt="nod">`;
                    videoOff.innerHTML = 'Video Off'
                    vidCont.classList.add('video-box');
                    newvideo.classList.add('video-frame');
                    newvideo.autoplay = true;
                    newvideo.playsinline = true;
                    newvideo.id = `video${sid}`;
                    console.log(sid)
                    if(hostId == sid) {
                        newvideo.style.visibility = 'visible';
                    } else {
                        newvideo.style.visibility = 'hidden';
                    }
                    newvideo.srcObject = event.streams[0];

                    if (micInfo[sid] == 'on')
                        muteIcon.style.visibility = 'hidden';
                    else
                        muteIcon.style.visibility = 'visible';
                    

                    if(host) {
                        if (happyInfo[sid] == 'on') {
                            happyIcon.style.visibility = 'visible';
                        }   
                        else {
                            happyIcon.style.visibility = 'hidden';
                        }

                        if (sadInfo[sid] == 'on') {
                            sadIcon.style.visibility = 'visible';
                        }   
                        else {
                            sadIcon.style.visibility = 'hidden';
                        }

                        if (thumbsUpInfo[sid] == 'on') {
                            thumbsUpIcon.style.visibility = 'visible';
                        }   
                        else {
                            thumbsUpIcon.style.visibility = 'hidden';
                        }

                        if (thumbsDownInfo[sid] == 'on') {
                            thumbsDownIcon.style.visibility = 'visible';
                        }   
                        else {
                            thumbsDownIcon.style.visibility = 'hidden';
                        }

                        if (nodInfo[sid] == 'on') {

                            numNod += 1;
                            nodIcon.style.visibility = 'visible';
                        }   
                        else {
                            nodIcon.style.visibility = 'hidden';
                        }

                        if (shakeInfo[sid] == 'on') {
                            nodIcon.style.visibility = 'visible';
                        }   
                        else {
                            nodIcon.style.visibility = 'hidden';
                        }

                        vidCont.appendChild(happyIcon);
                        vidCont.appendChild(sadIcon);
                        vidCont.appendChild(thumbsUpIcon);
                        vidCont.appendChild(thumbsDownIcon);
                        vidCont.appendChild(nodIcon);
                        vidCont.appendChild(shakeIcon);
                    }

                    if (videoInfo[sid] == 'on')
                        videoOff.style.visibility = 'hidden';
                    else
                        videoOff.style.visibility = 'visible';

                    vidCont.appendChild(newvideo);
                    vidCont.appendChild(name);
                    vidCont.appendChild(muteIcon);
                    vidCont.appendChild(videoOff);

                    videoContainer.appendChild(vidCont);

                }

            };

            connections[sid].onremovetrack = function (event) {
                if (document.getElementById(sid)) {
                    document.getElementById(sid).remove();
                }
            }

            connections[sid].onnegotiationneeded = function () {

                connections[sid].createOffer()
                    .then(function (offer) {
                        return connections[sid].setLocalDescription(offer);
                    })
                    .then(function () {

                        socket.emit('video-offer', connections[sid].localDescription, sid);

                    })
                    .catch(reportError);
            };

        });

        Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(() => {
            console.log('added all sockets to connections');
            startCall();
            main();
            startNodDetect();
        })

    }
    else {
        Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(() => {
            console.log('waiting for someone to join');
            navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localStream => {
                myvideo.srcObject = localStream;
                myvideo.muted = true;
                mystream = localStream;
                main();
                startNodDetect();
            })
            .catch(handleGetUserMediaError);
        })
    }
})

socket.on('remove peer', sid => {
    if (document.getElementById(sid)) {
        document.getElementById(sid).remove();
    }

    delete connections[sid];
})

sendButton.addEventListener('click', () => {
    const msg = messageField.value;
    messageField.value = '';
    socket.emit('message', msg, username, roomid);
})

messageField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendButton.click();
    }
});

socket.on('message', (msg, sendername, time) => {
    chatRoom.scrollTop = chatRoom.scrollHeight;
    chatRoom.innerHTML += `<div class="message">
    <div class="info">
        <div class="username">${sendername}</div>
        <div class="time">${time}</div>
    </div>
    <div class="content">
        ${msg}
    </div>
</div>`
});

socket.on('update attendees', (attendees) => {
  // update the attendees list on the UI
  attendeesList.innerHTML = '';

  attendees.forEach((attendee) => {
    const li = document.createElement('li');
    li.textContent = attendee;
    attendeesList.appendChild(li);
  });
});





/** Emotions  */
var calibrateHappy = 0.8;
var calibrateSad = 0.8;
var calibrateFear = 0.8;

videoButt.addEventListener('click', () => {

    if (videoAllowed) {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = false;
        }
        videoButt.innerHTML = `<i class="fas fa-video-slash"></i>`;
        videoAllowed = 0;
        videoButt.style.backgroundColor = "#b12c2c";

        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    track.enabled = false;
                }
            })
        }

        myvideooff.style.visibility = 'visible';

        socket.emit('action', 'videooff');
    }
    else {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = true;
        }
        videoButt.innerHTML = `<i class="fas fa-video"></i>`;
        videoAllowed = 1;
        videoButt.style.backgroundColor = "#4ECCA3";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'video')
                    track.enabled = true;
            })
        }

        myvideooff.style.visibility = 'hidden';

        socket.emit('action', 'videoon');
    }
});




myvideo.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(myvideo);
    document.body.append(canvas)
    const displaySize = { width: myvideo.width, height: myvideo.height }
    faceapi.matchDimensions(canvas, displaySize);
      

    setInterval(async () => {

        /** Emotions **/
        const detections = await faceapi.detectAllFaces(myvideo, 
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        if(detections[0].expressions.sad > calibrateSad || detections[0].expressions.fearful > calibrateFear){
        happyAllowed = 0;
        sadAllowed = 1;

        if(host) {
            myhappyicon.style.visibility = 'hidden';
            mysadicon.style.visibility = 'visible';
        }

        socket.emit('action', 'happyoff');
        socket.emit('action', 'sadon');
        }

        else if(detections[0].expressions.happy > calibrateHappy){
        happyAllowed = 1;
        sadAllowed = 0;

        if(host) {
            myhappyicon.style.visibility = 'visible';
            mysadicon.style.visibility = 'hidden';
        }

        socket.emit('action', 'happyon');
        socket.emit('action', 'sadoff');
        } 
        else {
            happyAllowed = 0;
            sadAllowed = 0;

            if(host) {
                myhappyicon.style.visibility = 'hidden';
                mysadicon.style.visibility = 'hidden';
            }
            socket.emit('action', 'happyoff');
            socket.emit('action', 'sadoff');
        }

    }, 100)

})


audioButt.addEventListener('click', () => {

    if (audioAllowed) {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = false;
        }
        audioButt.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        audioAllowed = 0;
        audioButt.style.backgroundColor = "#b12c2c";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'audio')
                    track.enabled = false;
            })
        }

        mymuteicon.style.visibility = 'visible';
        socket.emit('action', 'mute');
    }
    else {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = true;
        }
        audioButt.innerHTML = `<i class="fas fa-microphone"></i>`;
        audioAllowed = 1;
        audioButt.style.backgroundColor = "#4ECCA3";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'audio')
                    track.enabled = true;
            })
        }

        mymuteicon.style.visibility = 'hidden';

        socket.emit('action', 'unmute');
    }
})

socket.on('action', (msg, sid) => {
    // console.log(msg)
    if (msg == 'mute') {
        console.log(sid + ' muted themself');
        document.querySelector(`#mute${sid}`).style.visibility = 'visible';
        micInfo[sid] = 'off';
        document.querySelector(`#happy-icon${sid}`).style.visibility = 'visible';
        happyInfo[sid] = 'on';
    }
    else if (msg == 'unmute') {
        // console.log(sid + ' unmuted themself');
        document.querySelector(`#mute${sid}`).style.visibility = 'hidden';
        micInfo[sid] = 'on';
        document.querySelector(`#happy-icon${sid}`).style.visibility = 'hidden';
        happyInfo[sid] = 'off';
    }
    else if (msg == 'happyon') {
        // console.log(sid + ' is happy');
        if(host) {
            document.querySelector(`#happy-icon${sid}`).style.visibility = 'visible';
        }
        happyInfo[sid] = 'on';
    }
    else if (msg == 'happyoff') {
        // console.log(sid + ' is not happy');
        if(host) {
            document.querySelector(`#happy-icon${sid}`).style.visibility = 'hidden';
        }
        happyInfo[sid] = 'off';
    }
    else if (msg == 'sadon') {
        // console.log(sid + ' is sad');
        if(host) {
            document.querySelector(`#sad-icon${sid}`).style.visibility = 'visible';
        }
        sadInfo[sid] = 'on';
    }
    else if (msg == 'sadoff') {
        // console.log(sid + ' is not sad');
        if(host) {
            document.querySelector(`#sad-icon${sid}`).style.visibility = 'hidden';
        }
        sadInfo[sid] = 'off';
    }
    else if (msg == 'thumbsup') {
        if(host) {
            document.querySelector(`#thumbs-up-icon${sid}`).style.visibility = 'visible';
        }
        thumbsUpInfo[sid] = 'on';
    }
    else if (msg == 'unthumbsup') {
        if(host) {
            document.querySelector(`#thumbs-up-icon${sid}`).style.visibility = 'hidden';
        }
        thumbsUpInfo[sid] = 'off';
    }
    else if (msg == 'thumbsdown') {
        if(host) {
            document.querySelector(`#thumbs-down-icon${sid}`).style.visibility = 'visible';
        }
        thumbsDownInfo[sid] = 'on';
    }
    else if (msg == 'unthumbsdown') {
        if(host) {
            document.querySelector(`#thumbs-down-icon${sid}`).style.visibility = 'hidden';
        }
        thumbsDownInfo[sid] = 'off';
    }
    else if (msg == 'nod') {
        console.log("nod")
        if(host) {
            document.querySelector(`#nod-icon${sid}`).style.visibility = 'visible';
        }
        nodInfo[sid] = 'on';
    }
    else if (msg == 'unnod') {
        if(host) {
            document.querySelector(`#nod-icon${sid}`).style.visibility = 'hidden';
        }
        nodInfo[sid] = 'off';
    }
    else if (msg == 'shake') {
        if(host) {
            document.querySelector(`#shake-icon${sid}`).style.visibility = 'visible';
        }
        shakeInfo[sid] = 'on';
    }
    else if (msg == 'unshake') {
        if(host) {
            document.querySelector(`#shake-icon${sid}`).style.visibility = 'hidden';
        }
        shakeInfo[sid] = 'off';
    }
    else if (msg == 'videooff') {
        // console.log(sid + 'turned video off');
        document.querySelector(`#vidoff${sid}`).style.visibility = 'hidden';
        videoInfo[sid] = 'off';
    }
    else if (msg == 'videoon') {
        // console.log(sid + 'turned video on');
        document.querySelector(`#vidoff${sid}`).style.visibility = 'hidden';
        videoInfo[sid] = 'on';
    }
})

whiteboardButt.addEventListener('click', () => {
    if (boardVisisble) {
        whiteboardCont.style.visibility = 'hidden';
        boardVisisble = false;
    }
    else {
        whiteboardCont.style.visibility = 'visible';
        boardVisisble = true;
    }
})

cutCall.addEventListener('click', () => {
    location.href = '/';
})

    //Time Interval Function
    let intervalObject = null;

    /**
     * Starts an interval timer with the chosen interval value.
     */
    function startInterval() {
      // Get the chosen interval value from the selected radio button.
      let interval = parseInt(document.querySelector('input[name="interval"]:checked').value);
      // Start the interval timer and store the object returned by the `timeInterval()` function.
       socket.emit('action', 'startinterval');
      intervalObject = timeInterval(function() {
        console.log(`Interval function executed! Chosen interval: ${interval} ms`);
        socket.emit('action', 'restartCount');
      }, interval);
      console.log(`Interval started with interval of ${interval} ms.`);
      // Disable the "Start Interval" button and enable the "Cancel Interval" button.
      startIntervalButton.disabled = true;
      cancelIntervalButton.disabled = false;
    }
    
    /**
     * Cancels the currently running interval timer, if there is one.
     */
    function cancelInterval() {
      if (intervalObject !== null) {
        intervalObject.cancel();
        console.log("Interval cancelled.");
        // Enable the "Start Interval" button and disable the "Cancel Interval" button.
        startIntervalButton.disabled = false;
        cancelIntervalButton.disabled = true;
        socket.emit('action', 'cancelinterval');
      } else {
        console.log("No interval to cancel.");
      }
    }
    
    /**
     * Creates and returns an object with a `cancel()` method that can be used to stop the interval timer.
     * @param {Function} callback - The function to execute at each interval.
     * @param {number} interval - The interval duration in milliseconds.
     * @returns {Object} - An object with a `cancel()` method that can be used to stop the interval timer.
     */
    function timeInterval(callback, interval) {
        let timerId = setInterval(callback, interval);
        return {
          cancel: function() {
            clearInterval(timerId);
          }
        };
      }

      startIntervalButton.addEventListener('click', () => {
        startInterval();
      })

      cancelIntervalButton.addEventListener('click', () => {
        cancelInterval();
      })

statBar.addEventListener('click', () => {
    stat.style.visibility = 'visible';
    chatRoom.style.display = 'none';
    attendeesList.style.display = 'none';
    chatCont.style.visibility = 'hidden';
})

chatBar.addEventListener('click', () => {
    stat.style.visibility = 'hidden';
    chatRoom.style.display = 'block';
    attendeesList.style.display = 'none';
    chatCont.style.visibility = 'visible';
})

attendeesBar.addEventListener('click', () => {
    attendeesList.style.display = 'block';
    stat.style.visibility = 'hidden';
    chatRoom.style.display = 'none';
    chatCont.style.visibility = 'visible';
})

async function main() {

    //Thumbs Down 
    // describe thumbs down gesture 👎
    const thumbsDownGesture = new fp.GestureDescription('thumbs_down');

    thumbsDownGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
    thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);

    thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownLeft, 0.9);
    thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownRight, 0.9);

    // do this for all other fingers
    for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
    }


      // configure gesture estimator
      // add "👎" and "👍" as sample gestures
      const knownGestures = [
        fp.Gestures.ThumbsUpGesture,
        thumbsDownGesture
      ];
      const GE = new fp.GestureEstimator(knownGestures);

      // load handpose model
      const model = await handpose.load();
    //   console.log("Handpose model loaded");

      // main estimation loop
      const estimateHands = async () => {

        // get hand landmarks from video
        // Note: Handpose currently only detects one hand at a time
        // Therefore the maximum number of predictions is 1
        const predictions = await model.estimateHands(myvideo, true);
        // console.log(predictions);
        if(predictions.length != 0) {
            const est = GE.estimate(predictions[0]?.landmarks, 9);
            // console.log(est);

            if(est.gestures[0]?.name == "thumbs_up") {
                // console.log("thumbs up")
                  thumbsUpAllowed = 1;
                  thumbsDownAllowed = 0;

                  if(host) {
                    mythumbsupicon.style.visibility = 'visible';
                    mythumbsdownicon.style.visibility = 'hidden';
                  }

                    socket.emit('action', 'thumbsup');
                    socket.emit('action', 'unthumbsdown');
            }
            else if(est.gestures[0]?.name == "thumbs_down") {
                // console.log("thumbs down")
                  thumbsUpAllowed = 0;
                  thumbsDownAllowed = 1;

                  if(host) {
                    mythumbsupicon.style.visibility = 'hidden';
                    mythumbsdownicon.style.visibility = 'visible';
                  }

                    socket.emit('action', 'unthumbsup');
                    socket.emit('action', 'thumbsdown');
            }
            else {
                  thumbsUpAllowed = 0;
                  thumbsDownAllowed = 0;

                  if(host) {
                    mythumbsupicon.style.visibility = 'hidden';
                    mythumbsdownicon.style.visibility = 'hidden';
                  }

                    socket.emit('action', 'unthumbsup');
                    socket.emit('action', 'unthumbsdown');
            }
        }  else {
                  thumbsUpAllowed = 0;
                  thumbsDownAllowed = 0;

                  if(host) {
                    mythumbsupicon.style.visibility = 'hidden';
                    mythumbsdownicon.style.visibility = 'hidden';
                  }

                    socket.emit('action', 'unthumbsup');
                    socket.emit('action', 'unthumbsdown');
        }  

        // ...and so on
        setTimeout(() => { estimateHands(); }, 100);
      };

      estimateHands();
    //   console.log("Starting predictions");
    }
