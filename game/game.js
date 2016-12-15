function Game(send) {
    function init(seed) {

    }

    const commands = {
        init,
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
