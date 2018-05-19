use super::basic;
use super::tile::Terrain;
use floodfill;
use grid::{Grid, Pos};

use rand::Rng;

pub(super) fn add_lakes<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) {
    let lake_level = basic::generate(level.width, level.height, rng);
    for pos in lake_level.inner_positions() {
        let lake = floodfill::flood(pos, |pos| basic::is_cave(pos, level));
    }
}

// find a path from
