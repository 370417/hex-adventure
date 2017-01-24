// Creates a game

function Game(send) {
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

    function init(seed) {
        player = createActor(Player);
        player.pos = Math.round(WIDTH * HEIGHT / 2);
        player.send = send;
        level = Level(player.pos, seed);
        level.actors.set(player.pos, player.id);
        for (const [pos, id] of level.actors) {
            schedule.push(id, 0);
        }
        
        for (const pos of level.positions) {
            const tile = level.types.get(pos);
            send(SET_TILE, pos, tile);
        }
return;
        while (true) {
            const id = schedule.pop();
            const actor = actors.get(id);
            const delay = actor.act(level);
            if (isNaN(delay)) {
                break;
            } else {
                 schedule.push(id, delay);
            }
        }
    }

    function move() {

    }

    function rest() {

    }

    const commands = {
        [INIT]: init,
        [MOVE]: move,
        [REST]: rest,
    };

    function receive(commandName, ...args) {
        const command = commands[commandName];
        if (!command) {
            throw `${commandName.toString()} is not a valid command`;
        }
        command(...args);
        send(OVER);
    }

    return receive;
}
