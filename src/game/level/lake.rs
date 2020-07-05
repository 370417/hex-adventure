use super::basic::{calc_shuffled_positions, carve_caves, is_cave, remove_isolated_walls};
use crate::game::util::floodfill::flood;
use crate::prelude::*;

// Idea for generating lakes: instead of current method, pick a random wall tile
// not in the outer edges, and perform a dijkstra search for a randomized distance,
// where the cost of traversing walls is low and the cost of traversing floor is
// high. We can pick a random point inside the newly-generated lake and iterate
// through that process again until we break connectivity.

/// Generate a basic level for the purposes of copying cave shapes.
///
/// Since we don't care about tunnels or dead ends, we can skip a lot of steps
/// usually involved in creating basic levels.
fn generate_messy_caves<R: Rng>(rng: &mut R) -> Grid<Terrain> {
    let mut level = Grid::new(|_pos| Terrain::Wall);
    let positions = calc_shuffled_positions(rng);
    carve_caves(&positions, &mut level);
    // remove more walls thatn usual to encourage larger rooms
    remove_isolated_walls(&mut level, 7);
    level
}

const MIN_LAKE_SIZE: usize = 30;

pub(super) fn add_lakes<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) {
    let exit_pos = grid::positions()
        .find(|&pos| level[pos] == Terrain::Exit)
        .expect("Exit not found.");
    let mut near_stairs = Grid::new(|_| false);
    near_stairs[exit_pos] = true;
    for pos in exit_pos.neighbors() {
        near_stairs[pos] = true;
    }
    if let Some(entrance_pos) = grid::positions().find(|&pos| level[pos] == Terrain::Entrance) {
        near_stairs[entrance_pos] = true;
        for pos in entrance_pos.neighbors() {
            near_stairs[pos] = true;
        }
    }
    let mut level_size = flood(exit_pos, |pos| floodable(pos, &level), false).len();
    let mut tries = 0;
    let mut lake_count = 0;
    while tries + lake_count < 1 {
        tries += 1;
        let mut lake_level = generate_messy_caves(rng);
        for pos in grid::inner_positions() {
            let lake = flood(pos, |pos| is_cave(pos, &lake_level), false);
            let mut lake_floor_size = 0;
            for &pos in &lake {
                lake_level[pos] = Terrain::Wall;
                if level[pos] == Terrain::Floor {
                    lake_floor_size += 1;
                }
            }
            if lake_floor_size == 0 {
                continue;
            }
            let level_size_with_lake = flood(
                exit_pos,
                |pos| floodable(pos, &level) && !lake.contains(&pos),
                false,
            )
            .len();
            if lake.len() >= MIN_LAKE_SIZE && level_size_with_lake == level_size - lake_floor_size {
                lake_count += 1;
                level_size -= lake_floor_size;
                for pos in lake {
                    if !near_stairs[pos] {
                        level[pos] = Terrain::Water;
                    }
                }
            }
        }
    }
    // We don't want to remove any groups of 4 or more walls because we could then
    // accidentally remove walls around an entrace/exit. So it's more convenient this
    // way, and groups of 4 or more walls look pretty nice anyway.
    remove_isolated_walls(level, 4);
}

fn floodable(pos: Pos, level: &Grid<Terrain>) -> bool {
    match level[pos] {
        Terrain::Floor | Terrain::Entrance | Terrain::Exit => true,
        _ => false,
    }
}
