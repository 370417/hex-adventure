function onopen(event) {
    socket.send('piglatin');
}

function onmessage(event) {
    console.log(event.data)
}

function onerror(event) {
    console.log('error')
}

let socket = new WebSocket('ws://localhost:4000');

socket.addEventListener('open', onopen);
socket.addEventListener('message', onmessage);
socket.addEventListener('error', onerror);
