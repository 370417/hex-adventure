// Describes actor behavior

const Actor = {
    act() {
        // execute an action then return delay until this actor's next turn
        const delay = this[this.state]();
        return delay;
    },
};

const Viewer = {
    act(level) {
        //this.tiles = fov(this.pos, this.transparent.bind(null, level));
        this.tiles = level.types;
    },
    transparent(level, pos) {
        return level.types.get(pos) !== WALL;
    },
}

const Human = {
    act(level) {
        this.super.act.call(this, level);
        for (const pos of this.tiles) {
            this.send(SET_TILE, pos, level.types.get(pos));
        }
        return NaN;
    },
};

function extend(subproto, superproto, ...superprotos) {
    if (superprotos.length) {
        superproto = extend(superproto, ...superprotos);
    }
    const proto = Object.assign({}, superproto, subproto);
    proto.super = superproto;
    return proto;
}

const Player = extend(Human, Viewer, Actor);
