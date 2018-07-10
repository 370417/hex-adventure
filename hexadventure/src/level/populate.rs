//! Populate a level with mobs

use super::basic::calc_shuffled_positions;
use super::tile::{Terrain, Tile};
use prelude::*;
use rand::Rng;

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> (Grid<Tile>, Vec<Mob>) {
    let positions = calc_shuffled_positions(rng);
    let mut level = Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    });
    let mut npcs = Vec::new();
    for pos in positions {
        if level[pos].terrain == Terrain::Floor {
            match npcs.len() {
                // 0 => {
                //     npcs.push(Mob {
                //         pos,
                //         facing: Direction::West,
                //         kind: Type::Skeleton,
                //         guard: 100,
                //         guard_recovery: 0,
                //     });
                //     level[pos].mob_id = Some(MobId::Npc(0));
                // }
                // 1 => {
                //     npcs.push(Mob {
                //         pos,
                //         facing: Direction::West,
                //         kind: Type::Skeleton2,
                //         guard: 100,
                //         guard_recovery: 0,
                //     });
                //     level[pos].mob_id = Some(MobId::Npc(1))
                // }
                _ => break,
            }
        }
    }
    (level, npcs)
}
