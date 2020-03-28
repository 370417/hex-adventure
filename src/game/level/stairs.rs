//! Add stairs between levels (entrances & exits).

use super::basic::{calc_shuffled_positions, count_neighbor_groups, count_neighbors};
use crate::prelude::*;

/// Given a basic level (only floor, wall, and entrance tiles), generate a new
/// basic level and link the two levels with an entrance/exit pair that share
/// the same location. If possible, they should also face the same direction so
/// that the player character doesn't appear to move when taking an exit.
pub fn generate_next<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) -> Grid<Terrain> {
    // Loop in case we generate a level that cannot link to the current one.
    loop {
        let mut next_level = super::basic::generate(rng);
        if let Some(stair_pos) = find_stair_pos(level, &next_level, rng) {
            level[stair_pos] = Terrain::Exit;
            next_level[stair_pos] = Terrain::Entrance;
            return next_level;
        }
    }
}

/// Add an entrance to a basic level. This is used for the first level only.
/// Subsequent levels will have entrances created by generate_next.
pub fn generate_entrance<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) -> Pos {
    let positions = calc_shuffled_positions(rng);
    for &pos in &positions {
        if is_valid_entrance(pos, level) {
            level[pos] = Terrain::Entrance;
            return pos;
        }
    }
    unreachable!();
}

fn find_stair_pos<R: Rng>(
    level: &Grid<Terrain>,
    next_level: &Grid<Terrain>,
    rng: &mut R,
) -> Option<Pos> {
    let positions = calc_shuffled_positions(rng);
    for &pos in &positions {
        if is_valid_exit(pos, level)
            && is_valid_entrance(pos, next_level)
            && is_stairs_aligned(pos, level, next_level)
        {
            return Some(pos);
        }
    }
    None
}

fn is_valid_exit(pos: Pos, level: &Grid<Terrain>) -> bool {
    let is_wall = |t| t == Terrain::Wall;
    let is_entrance = |t| t == Terrain::Entrance;
    level[pos] == Terrain::Wall
        && count_neighbor_groups(pos, level, is_wall) == 1
        && count_neighbors(pos, level, is_wall) == 4
        && count_neighbors(pos, level, is_entrance) == 0
}

fn is_valid_entrance(pos: Pos, level: &Grid<Terrain>) -> bool {
    let is_wall = |t| t == Terrain::Wall;
    level[pos] == Terrain::Wall
        && count_neighbor_groups(pos, level, is_wall) == 1
        && count_neighbors(pos, level, |t| t == Terrain::Wall) == 4
}

fn is_stairs_aligned(pos: Pos, level: &Grid<Terrain>, next_level: &Grid<Terrain>) -> bool {
    for neighbor in pos.neighbors() {
        if level[neighbor] == Terrain::Floor && next_level[neighbor] != Terrain::Floor {
            return false;
        }
    }
    true
}
