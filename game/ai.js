// Describes actor behavior

function extend(subproto, superproto, ...superprotos) {
    if (superprotos.length) {
        superproto = extend(superproto, ...superprotos);
    }
    const proto = Object.assign({}, superproto, subproto);
    proto.super = superproto;
    return proto;
}


const Actor = {
    act() {
        const action = null;
        const delay = 12;
        return {action, delay};
    },
};


const AI = {

};
