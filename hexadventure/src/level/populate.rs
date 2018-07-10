//! Populate a level with mobs

use super::basic::calc_shuffled_positions;
use super::tile::{Terrain, Tile};
use prelude::*;
use rand::Rng;
use world::mob::{Npcs, PLAYER_ID};

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> (Grid<Tile>, Npcs) {
    let positions = calc_shuffled_positions(rng);
    let mut level = Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    });
    let npcs = Npcs::new();
    (level, npcs)
}
