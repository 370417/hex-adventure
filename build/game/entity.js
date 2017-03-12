export function createEntity(entities) {
    const entity = { id: entities.nextId };
    entities[entity.id] = entity;
    entities.nextId++;
    return entity;
}
