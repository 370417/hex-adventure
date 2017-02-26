// Creates a game

this.Game = {
    version: '0.1.0',
    SAVE_NAME: 'hex adventure',

    // load save game if it exists, otherwise create a new game
    getGame() {
        let game = this.load()
        if (!game) {
            game = Game.create(Date.now())
        }
        if (game.version !== this.version) {
            console.warn('Save game is out of date')
        }
        console.log('Seed:', game.seed)
        return game
    },

    create(seed) {
        const game = {
            version: this.version,
            seed: seed,
        }

        Entity.init(game)
        Schedule.init(game)

        return game
    },

    save(game) {
        localStorage[this.SAVE_NAME] = JSON.stringify(game)
    },

    load() {
        const saveFile = localStorage[this.SAVE_NAME]
        return saveFile && JSON.parse(saveFile)
    },

    // precondition: player has just completed an action and has scheduled himself
    loop(game) {
        while (true) {
            const id = Schedule.pop(game)
            const delay = Actor.act(game, id)
            if (delay === undefined) break // delay is undefined if the actor needs outside input
            if (delay !== Infinity) Schedule.push(game, id, delay)
        }
    },
}
