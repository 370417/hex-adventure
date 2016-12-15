// Creates a game

function Game(send) {
    function init(seed) {

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
            throw `${commandName} is not a valid command`;
        }
        command(...args);
        send('over');
    }

    return receive;
}
