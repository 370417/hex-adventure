this.Behavior = {
    player(game) {
        return true
    },
}

this.Actor = {
    create(game, behavior) {
        const actor = Entity.create(game)
        actor.behavior = behavior
        return actor
    },

    step(game) {
        const id = game.schedule.shift()
        const entity = Entity.get(game, id)
        // Actor.behaviors[entity.behavior](game)
        return Behavior[entity.type](game)
    },

    loop(game) {
        while (true) {
            const id = Schedule.pop(game.schedule)
            const delay = Actor.act(game, id)
            if (delay === undefined) break
            if (delay !== Infinity) Schedule.push(game.schedule, id, delay)
        }
    },

    behaviors: {},
}

const exampleMonster = {
    id: 435,
    type: 'orc',
    pos: 678,
}
