function startGame(tiles) {
    const display = Display(document.getElementById('game'), tiles);
}


loadTiles('tileset.png', tilemap, 18, 24, startGame);
