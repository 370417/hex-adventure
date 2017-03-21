export interface Entity {
    id: number
    [property: string]: any
}

export interface Entities {
    nextId: number
    [key: number]: Entity
}

/** create an entity */
export function create(entities: Entities): Entity {
    const entity = {id: entities.nextId}
    entities[entity.id] = entity
    entities.nextId++
    return entity
}
