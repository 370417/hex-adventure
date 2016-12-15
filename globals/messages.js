// Constants for message commands

(() => {
    const messages = ['OVER', 'MOVE', 'REST'];

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        this[message] = Symbol(message);
    }
})();