// manages entities

// create an entity manager
function Entities() {
    const entities = new Map()
    let nextId = 1

    function create() {
        const entity = {id: nextId}
        entities.set(nextId, entity)
        nextId++
        return entity
    }

    function get(id) {
        return entities.get(id)
    }

    return {
        create,
        get,
    }
}
