// Describes actor behavior

/*const Actors = {
    Player() {
        return {
            ai: AI.Player,
        }
    },
}

const Actor = {

    act() {
        // execute an action then return delay until this actor's next turn
        const delay = this[this.state]()
        return delay
    },
}

const

function extend(subproto, superproto, ...superprotos) {
    if (superprotos.length) {
        superproto = extend(superproto, ...superprotos)
    }
    const proto = Object.assign({}, superproto, subproto)
    proto.super = superproto
    return proto
}

const Player = extend(Actor, Object)
*/

// Tile
// Floor         Walking  / Standing
// Deep Water    Swimming / Treading
// Shallow Water Wading   / Standing
//

(() => {
    function act(...env) {
        return this[this.state].call(this, ...env)
    }

    this.Actors = {
        Player: {},
    }
})()
