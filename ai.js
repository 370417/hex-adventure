function extend(subproto, superproto, ...superprotos) {
    if (superprotos.length) {
        superproto = extend(superproto, ...superprotos);
    }
    const proto = Object.assign({}, superproto, subproto);
    proto.super = superproto;
    return proto;
}


const AI = {
    init(kwargs) {

    },

    act() {

    },
};
