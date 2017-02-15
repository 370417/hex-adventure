// Creates a game

function Game(display) {
    let level;
    const schedule = Schedule();
    let player;

    const actors = new Map();
    let nextActorId = 1;
    function createActor(proto) {
        const actor = Object.create(proto);
        actor.id = nextActorId;
        actors.set(nextActorId, actor);
        nextActorId += 1;
        return actor;
    }

    function gameLoop() {
        while (true) {
            const id = schedule.pop();
            const actor = actors.get(id);
        }
    }

    function init(seed) {
        player = createActor(Actors.Player);
        player.pos = xy2pos(24, 15);
        level = Level(player, seed);
        for (const pos in level.actors) {
            const id = level.actors[pos];
            schedule.push(id, 0);
        }

        for (const pos of level.positions) {
            const tile = level.types.get(pos);
            display.setTile(pos, tile);
        }
        display.over();
    }

    function move() {

    }

    function rest() {

    }

    const gameAPI = {
        init,
        move,
        rest,
    };

    return gameAPI;
}
