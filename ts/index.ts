const texture = document.getElementById('texture') as HTMLCanvasElement;
const textureCtx = texture.getContext('2d');

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

console.log('Downloading js');
import('../pkg/index.js').then(({ Client }) => {
    console.log('Downloading wasm');
    import('../pkg/index_bg').then(({ memory }) => {
        const spriteWidth = Client.sprite_width();
        const spriteHeight = Client.sprite_height();
        canvas.width = Client.level_pixel_width();
        canvas.height = Client.level_pixel_height();
        console.log(canvas.width, canvas.height)
        console.log(Client.load(Client.new(BigInt(performance.now())).save()).save());
        const sprites = Client.expose_sprites();
        const arr = new Uint8ClampedArray(memory.buffer, sprites.rgba, sprites.size);
        const d = new ImageData(arr, sprites.width);
        textureCtx.putImageData(d, 0, 0);

        for (let row = 0; row < Client.level_height(); row++) {
            for (let col = 0; col < Client.level_width(); col++) {
                const { x, y } = Client.location(row, col);
                ctx.drawImage(texture, 0, 72 - 18, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);
            }
        }
    }, console.error);
}, console.error);
