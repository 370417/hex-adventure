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

function drawTile(x, y, tileName) {
    tile = tiles[tileName];
    const ctx = ctxs[y];
    const realx = (x - (height - y - 1) / 2) * xu;
    ctx.drawImage(tile.canvas, 0, 0, xu, bigyu, realx, 0, xu, bigyu);
}

let progress = 0;
function startGame() {
    progress += 1;
    if (progress == 2) {
        socket.send('piglatin');
        socket.send('command arg');
    }
}

function onmessage(event) {
    const lines = event.data.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const [time, command, arg] = lines[i].split(' ');
        if (command === 'newtile') {
            let [tile, x, y] = arg.split(',');
            x = +x;
            y = +y;
            drawTile(x, y, tile);
        }
    }
}

function onerror(event) {
    console.log('error')
}

let socket = new WebSocket('ws://localhost:4000');

socket.addEventListener('open', startGame);
socket.addEventListener('message', onmessage);
socket.addEventListener('error', onerror);
