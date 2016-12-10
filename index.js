const display = Display();

const level = Level(xy2pos(5, 5));

for (const pos in level.passable) {
    const tile = level.passable[pos] ? 'wall' : 'floor';
    display.drawTile(pos, tile);
}
