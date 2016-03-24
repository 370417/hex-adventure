import createTile from "./tile";

// create a 2d array with dimensions width by height and filled with content
const create2dArray = (width, height, content) => {
    const isFunction = typeof content === "function";
    const array = [];
    for (let x = 0; x < width; x++) {
        array[x] = [];
        for (let y = 0; y < height; y++) {
            array[x][y] = isFunction ? content() : content;
        }
    }
    return array;
};

// get the 2d coordinates like array[x][y] corresponding to a 1d index
const getCoord = (index, width, height) => {
    const y = index % height;
    const x = (index - y) / height;
    return [x, y];
};

// return a random number in the range [lower, upper]
const randInt = (lower, upper, prng = Math.random) => {
    if (lower > upper) {
        console.error("lower > upper");
        return NaN;
    }
    return lower + Math.floor((upper - lower + 1) * prng());
};

// create a shuffled range of ints in [0, size)
const randRange = (size, prng = Math.random) => {
    const array = [];
    for (let i = 0; i < size; i++) {
        let j = randInt(0, i, prng);
        if (j !== i) {
            array[i] = array[j];
        }
        array[j] = i;
    }
};

// whether point (x, y) is on the edge of the level
const onEdge = (x, y, width, height) => x === 0 || y === 0 || x === width - 1 || y === height - 1;

// TODO
const xDir8 = [0, 1, 1, 1, 0,-1,-1,-1];
const yDir8 = [1, 1, 0,-1,-1,-1, 0, 1];

// whether point (x, y) is surrounded by type
const surrounded = (x, y, type) => {

};

// generate floor in the level to create caves
const generateFloor = (level, width, height, prng = Math.random) => {
    // loop through the level randomly
    randRange(width * height, prng).forEach(index => {
        const [x, y] = getCoord(index, width, height);
        if (!onEdge(x, y, width, height)) {

        }
    });
};

export default ({width, height, prng = Math.random}) => {
	// create a 2d array to represent the level
	const level = create2dArray(width, height, createTile.bind(null, "wall"));

    

	return level;
};