//! Populate a level with mobs

use super::basic::calc_shuffled_positions;
use super::tile::{Terrain, Tile};
use grid::{Direction, Grid};
use mob::{Mob, Type};
use rand::Rng;
use game::MobId;

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> (Grid<Tile>, Vec<Mob>) {
    let positions = calc_shuffled_positions(rng);
    let mut level = Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    });
    let mut npcs = Vec::new();
    for pos in positions {
        if level[pos].terrain == Terrain::Floor {
            npcs.push(Mob {
                pos,
                facing: Direction::West,
                kind: Type::Skeleton,
                guard: 100,
                guard_recovery: Vec::new(),
            });
            level[pos].mob_id = Some(MobId::Npc(0));
            break;
        }
    }
    (level, npcs)
}
