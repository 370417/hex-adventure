const Behavior = {
    player(game) {
        return Infinity;
    },
};
// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }
export function step(game) {
    const id = game.schedule[0];
    const entity = game.entities[id];
    return Behavior[entity.type](game);
}
function nextTurn(game) {
    const id = game.schedule.shift();
    game.schedule.push(id);
}
function expire(game) {
    game.schedule.shift();
}
