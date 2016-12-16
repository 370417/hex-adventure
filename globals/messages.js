// Constants for message commands

(() => {
    const messages = ['INIT', 'OVER', 'MOVE', 'REST', 'SET_TILE'];

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        this[message] = Symbol(message);
    }
})();
