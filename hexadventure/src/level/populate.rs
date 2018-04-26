//! Populate a level with mobs

use grid::Grid;
use level::tile::{Terrain, Tile};

pub fn populate(level: Grid<Terrain>) -> Grid<Tile> {
    Grid::new(level.width, level.height, |pos| Tile {
        terrain: level[pos],
        mob: None,
    })
}
