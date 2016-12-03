const width = 48;
const height = 31;

const xu = 18;
const smallyu = 16;
const bigyu = 24;

const $canvases = document.getElementById('canvases');
const canvaseswidth = (width - height / 2 + 1) * xu;
const canvasesheight = bigyu + (height - 1) * smallyu;
$canvases.style.width = canvaseswidth + 'px';
$canvases.style.height = canvasesheight + 'px';

const canvases = [];
const ctxs = [];
for (let y = 0; y < height; y++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvaseswidth;
    canvas.height = bigyu;
    canvas.style.top = y * smallyu + 'px';
    const ctx = canvas.getContext('2d');
    canvases[y] = canvas;
    ctxs[y] = ctx;
    $canvases.appendChild(canvas);
}

function onopen(event) {
    socket.send('piglatin');
    socket.send('command arg');
}

function onmessage(event) {
    const lines = event.data.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const [time, command, arg] = lines[i].split(' ');
        if (command === 'newtile') {
            let [tile, x, y] = arg.split(',');
            x = +x;
            y = +y;
            console.log(x, y)
        }
    }
}

function onerror(event) {
    console.log('error')
}

let socket = new WebSocket('ws://localhost:4000');

socket.addEventListener('open', onopen);
socket.addEventListener('message', onmessage);
socket.addEventListener('error', onerror);
