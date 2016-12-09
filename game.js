(() => {
    const protoGame = {

    };


    function Game(width, height, seed) {
        const game = {
            width,
            height,
            seed,
        };
        return Object.create(protoGame, game);
    }


    this.Game = Game;
})();