this.Behavior = {
    player(game) {
        return Infinity
    },
}

this.Actor = {
    PAUSE_TURN: 1,
    END_TURN: 2,
    DELETE: 3,

    create(game, behavior) {
        const actor = Entity.create(game)
        actor.behavior = behavior
        return actor
    },

    step(game) {
        const id = game.schedule[0]
        const entity = game.entities[id]
        return Behavior[entity.type](game)
    },

    behaviors: {},
}

const exampleMonster = {
    id: 435,
    type: 'orc',
    pos: 678,
}
