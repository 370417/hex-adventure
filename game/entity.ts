export interface Entity {
    id: number,
    [component: string]: any
}

export interface Entities {
    nextId: number,
    [id: number]: Entity,
}

export function createEntity(entities: Entities):Entity {
    const entity = {id: entities.nextId}
    entities[entity.id] = entity
    entities.nextId++
    return entity
}