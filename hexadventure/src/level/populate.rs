//! Populate a level with mobs

use super::basic::calc_shuffled_positions;
use super::tile::Terrain;
use grid::{Direction, Grid};
use mob::{Mob, Type};
use rand::Rng;

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> Grid<(Terrain, Option<Mob>)> {
    let positions = calc_shuffled_positions(rng);
    let mut level = Grid::new(|pos| (level[pos], None));
    for pos in positions {
        if level[pos].0 == Terrain::Floor {
            level[pos].1 = Some(Mob {
                pos,
                facing: Direction::West,
                kind: Type::Skeleton,
            });
            break;
        }
    }
    level
}
