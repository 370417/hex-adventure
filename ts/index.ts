import { RawImage } from '../pkg/index.js';

console.log('Downloading js');
import('../pkg/index.js').then(({ Client }) => {
    console.log('Downloading wasm');
    import('../pkg/index_bg').then(({ memory }) => {
        const client = Client.new(BigInt(performance.now()));
        const spriteWidth = Client.sprite_width();
        const spriteHeight = Client.sprite_height();

        const ctx = createCanvas(Client.level_pixel_width(), Client.level_pixel_height());

        const texture = createTexture(Client.expose_sprites(), memory);

        for (let row = 0; row < Client.level_height(); row++) {
            for (let col = 0; col < Client.level_width(); col++) {
                // Sprite color
                texture.fillStyle = client.color(row, col);

                // Source rectangle
                const { x: sx, y: sy } = client.texture_location(row, col);
                const sw = spriteWidth;
                const sh = spriteHeight;

                // Destination rectangle
                const { x: dx, y: dy } = Client.location(row, col);
                const dw = spriteWidth;
                const dh = spriteHeight;

                // Apply color to the texture
                texture.fillRect(sx, sy, sw, sh);

                // Draw the texture on the main canvas
                ctx.drawImage(texture.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
            }
        }
    }, console.error);
}, console.error);

// Create the main canvas and attach it to the DOM.
function createCanvas(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.insertAdjacentElement('beforeend', canvas);

    const ctx = canvas.getContext('2d');
    // Make sure the pixel art is not blurred
    ctx.imageSmoothingEnabled = false;
    return ctx;
}

// Load the spritesheet from web assembly memory and store it in an invisible canvas.
function createTexture(sprites: RawImage, memory: WebAssembly.Memory): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = sprites.width;
    canvas.height = sprites.height;

    const arr = new Uint8ClampedArray(memory.buffer, sprites.rgba, sprites.size);
    const image = new ImageData(arr, sprites.width);
    ctx.putImageData(image, 0, 0);

    // Prepare the canvas for future color changes, which will be performed by drawing
    // filled colored rectangles.
    ctx.globalCompositeOperation = 'source-atop';

    return ctx;
}
