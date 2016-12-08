const protoMap = {
    get(x, y) {
        return this.tiles[x + y * this.width];
    },


    set(x, y, val) {
        this.tiles[x + y * this.width] = val;
    },


    has(x, y) {
        return x + y * this.width in this.tiles;
    },
};


function Map(width) {
    const map = {
        width,
        tiles: {},
    };
    return Object.create(protoMap, map);
}
