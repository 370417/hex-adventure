const display = Display();

const level = Level(xy2pos(5, 5));

for (const pos of level.positions) {
    const tile = level.passable.has(pos) ? 'floor' : 'wall';
    display.drawTile(pos, tile);
}
