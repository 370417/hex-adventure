//! Populate a level with mobs

use super::tile::{Terrain, Tile};
use grid::Grid;

pub(super) fn populate(level: Grid<Terrain>) -> Grid<Tile> {
    Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    })
}
