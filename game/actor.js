this.Actor = {
    create(game, behavior) {
        const actor = Entity.create(game)
        actor.behavior = behavior
        return actor
    },

    act(game, id) {
        const entity = Entity.get(game, id)
        Actor.behaviors[entity.behavior](game)
    },

    behaviors: {
        player(game) {},
    },
}
