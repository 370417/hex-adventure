(() => {
    const protoGame = {

    };


    function Game(seed) {
        const game = {
            seed,
        };

        return Object.create(protoGame, game);
    }


    this.Game = Game;
})();
