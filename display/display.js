// Creates a GUI for the game

this.Display = {
    xu: 18,
    smallyu: 16,
    bigyu: 24,
    root: document.getElementById('game'),
    game: Game.getGame(),

    init() {
        Display.createTiles()
        Display.loop()
    },

    loop() {
        let delay = 0
        while (!delay) {
            delay = Actor.step(Display.game)
        }
        Display.render(Display.game)
        if (delay === Infinity) {
            save()
        } else {
            Display.defer(loop, delay)
        }
    },

    defer(fun, frames) {

    },

    positionTile(tile, x, y) {
        const realx = (x - (Level.HEIGHT - y - 1) / 2) * this.xu
        const realy = (y - 1) * this.smallyu + this.bigyu
        tile.style.left = realx + 'px'
        tile.style.top = realy + 'px'
    },

    createTiles() {
        const tiles = document.createElement('div')
        tiles.id = 'tiles'

        Level.forEachPos((pos, x, y) => {
            const tile = document.createElement('div')
            tile.classList.add('tile')
            tile.dataset.type = 'NULL'
            this.positionTile(tile, x, y)
            tiles.appendChild(tile)
        })

        this.root.appendChild(tiles)
    },
}
