(() => {
    const protoGame = {

    };


    function Game(seed) {
        const game = {
            seed,
        };

        const view = {
            look(actor) {
                return 'map of positions to tiles \ actors';
            },

            move(actor, direction) {
                // move actor in level
            },

            attack(actor, pos) {
                // attck target position
            },
        };

        return Object.create(protoGame, game);
    }


    this.Game = Game;
})();
