// manages entities

this.Entity = {
    init(game) {
        game.entities = {}
        game.nextEntityId = 1
    },

    create(game) {
        const entity = {id: game.nextEntityId}
        game.entities[entity.id] = entity
        game.nextEntityId++
        return entity
    },

    get(game, id) {
        return game.entities[id]
    },
}
