const colors = {
	white: "#FFF"
};

const prototype = {
	// set the dimensions of the dislpay
	// unit is the size in pixels of a tile
	// scale scales everything up
	setDimensions(width, height, unit, scale) {
		this.width = width;
		this.height = height;
		this.unit = unit;
		this.scale = scale;
		this.canvas.width = width * unit;
		this.canvas.height = height * unit;
		this.canvas.style.width = width * unit * scale + "px";
		this.canvas.style.height = height * unit * scale + "px";
	},
	// load the spritesheet then call callback
	load(path, callback) {
		this.tileset = document.createElement("img");
		this.tileset.addEventListener("load", callback);
		this.tileset.src = path;
		document.body.appendChild(this.tileset);
	},
	// log text to the message buffer
	log(text) {
		this.messages.innerHTML += text;
	},
	// draw a level
	draw(level) {
		for (let x = 0; x < this.width; x++) for (let y = 0; y < this.height; y++) {
			let tile = this.cacheTile(level[x][y]);
			this.ctx.drawImage(tile.canvas, 0, 0, this.unit, this.unit, x * this.unit, y * this.unit, this.unit, this.unit);
		}
	},
	cacheTile(tile) {
        const u = this.unit;
		const canvas = document.createElement("canvas");
		canvas.width = u;
		canvas.height = u;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(this.tileset, tile.spritex * u, tile.spritey * u, u, u, 0, 0, u, u);
        ctx.fillStyle = colors[tile.color];
        ctx.globalCompositeOperation = "source-in";
        ctx.fillRect(0, 0, u, u);
		tile.canvas = canvas;
		return tile;
	},
};

export default ({root}) => {
	const display = Object.create(prototype);

	// setup messages
	display.messages = document.createElement("div");
	display.messages.setAttribute("id", "messages");
	root.appendChild(display.messages);

	// setup canvas
	display.canvas = document.createElement("canvas");
	root.appendChild(display.canvas);
	display.ctx = display.canvas.getContext("2d");

	display.log("Loading... ");

	return display;
};