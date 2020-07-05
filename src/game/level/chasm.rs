use super::basic::is_cave;
use crate::game::util::floodfill::flood;
use crate::prelude::*;
use std::collections::HashSet;

const MIN_CHASM_SIZE: usize = grid::WIDTH + grid::HEIGHT;

pub fn add_chasms<R: Rng>(level: &mut Grid<Terrain>, next_level: &Grid<Terrain>, rng: &mut R) {
    let mut visited = Grid::new(|_pos| false);

    let mut entrance_pos = grid::corner();
    let mut exit_pos = grid::corner();
    for pos in grid::inner_positions() {
        match level[pos] {
            Terrain::Entrance => entrance_pos = pos,
            Terrain::Exit => exit_pos = pos,
            _ => {}
        }
    }

    for pos in grid::inner_positions() {
        let cave = flood(
            pos,
            &|pos: Pos| !visited[pos] && is_cave(pos, next_level),
            true,
        );
        let mut overlaps_stairs = false;
        for &pos in &cave {
            visited[pos] = true;
            // make sure we don't overlap neighborhood of entrance/exit
            if pos.distance(entrance_pos) < 2 || pos.distance(exit_pos) < 2 {
                overlaps_stairs = true;
            }
        }
        if !overlaps_stairs && cave.len() >= MIN_CHASM_SIZE {
            add_chasm(level, &cave, rng);
        }
    }
}

fn add_chasm<R: Rng>(level: &mut Grid<Terrain>, cave: &HashSet<Pos>, rng: &mut R) {
    for &pos in cave {
        level[pos] = Terrain::Chasm;
    }

    // remove_small_walls(level, cave);
}

fn remove_small_walls(level: &mut Grid<Terrain>, chasm: &HashSet<Pos>) {
    let mut visited = HashSet::new();
    for &pos in chasm {
        for neighbor in pos.neighbors() {
            if level[neighbor] == Terrain::Wall {
                let wall_group = flood(
                    neighbor,
                    &|pos: Pos| !visited.contains(&pos) && level[pos] == Terrain::Wall,
                    true,
                );
                // We don't want to remove any groups of 4 or more walls because we could then
                // accidentally remove walls around an entrace/exit. So it's more convenient this
                // way, and groups of 4 or more walls look pretty nice anyway.
                if wall_group.len() < 4 {
                    for &pos in &wall_group {
                        level[pos] = Terrain::Floor;
                    }
                }
                visited.extend(wall_group);
            }
        }
    }
}
