//! Populate a level with mobs

use super::tile::{Terrain, Tile};
use grid::Grid;
use rand::Rng;

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> Grid<Tile> {
    Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    })
}
