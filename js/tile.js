const Tiles = {
	wall: {
        type: "wall",
        color: "white",
		spritex: 3,
		spritey: 4,
	},
    floor: {
        type: "floor",
        color: "white",
        spritex: 1,
        spritey: 4,
    },
};

export default name => {
	return Object.create(Tiles[name]);
};