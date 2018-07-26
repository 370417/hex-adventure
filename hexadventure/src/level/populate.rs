//! Populate a level with mobs

use super::basic::calc_shuffled_positions;
use super::tile::{Terrain, Tile};
use prelude::*;
use rand::Rng;
use world::mob::{Npcs, Species};

pub(super) fn populate<R: Rng>(level: Grid<Terrain>, rng: &mut R) -> (Grid<Tile>, Npcs) {
    fn near_entrance(pos: Pos, level: &Grid<Tile>) -> bool {
        pos.neighbors()
            .any(|pos| level[pos].terrain == Terrain::Entrance)
    }

    let positions = calc_shuffled_positions(rng);
    let mut level = Grid::new(|pos| Tile {
        terrain: level[pos],
        mob_id: None,
    });
    let mut npcs = Npcs::new();
    let mut npc_count = rng.gen_range(0, 2);
    let max_npcs = rng.gen_range(4, 7);
    for pos in positions {
        if level[pos].terrain.passable() && !near_entrance(pos, &level) {
            let species = match npc_count % 2 {
                0 => Species::Bat,
                _ => Species::Rat,
            };
            let mob = Mob::new(pos, species);
            let mob_id = npcs.insert(mob);
            level[pos].mob_id = Some(mob_id);
            npc_count += 1;
            if npc_count >= max_npcs {
                break;
            }
        }
    }
    (level, npcs)
}

/// Place a mob as close as possible to a position in the level
pub fn place_mob<R: Rng>(level: &mut Grid<Tile>, center: Pos, mob_id: MobId, rng: &mut R) -> Pos {
    let flip = rng.gen();
    for r in 0.. {
        for pos in center.ring(r) {
            let pos = if flip { center - (pos - center) } else { pos };
            if level[pos].terrain.passable() {
                level[pos].mob_id = Some(mob_id);
                return pos;
            }
        }
    }
    unreachable!()
}
