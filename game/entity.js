// manages entities

this.Entities = {
    create() {
        return {
            collection: {},
            nextEntityId: 1,
        }
    }
}

this.Entity = {
    create(entities) {
        const entity = {id: entities.nextEntityId}
        entities.collection[entity.id] = entity
        entities.nextEntityId++
        return entity
    },

    get(entities, id) {
        return entities.collection[id]
    },
}
