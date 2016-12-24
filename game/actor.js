// Describes actor behavior

const Actor = {
    act() {
        // execute an action then return delay until this actor's next turn
        const delay = this[this.state]();
        return delay;
    },
};

const Viewer = {
    act({fov}) {
        fov(pos => {
            this.visible.add(pos);
        });
    },
}

const Human = {
    act({display}) {
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

const Player = extend(Actor, Object);
