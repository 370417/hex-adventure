//! Generate a connected level of only wall and floor tiles.

use crate::game::util::{self, floodfill::flood};
use crate::prelude::*;
use rand::seq::SliceRandom;
use std::collections::HashSet;

const MIN_CAVE_SIZE: usize = 4;
const MIN_WALL_SIZE: usize = 6;

pub(super) fn generate<R: Rng>(rng: &mut R) -> Grid<Terrain> {
    let mut grid = Grid::new(|_pos| Terrain::Wall);
    let positions = calc_shuffled_positions(rng);
    carve_caves(&positions, &mut grid);
    connect_edges(&positions, &mut grid);
    remove_isolated_walls(&mut grid);
    remove_isolated_floors(&mut grid);
    remove_small_caves(&mut grid);
    grid
}

pub(super) fn calc_shuffled_positions<R: Rng>(rng: &mut R) -> Vec<Pos> {
    let mut positions: Vec<Pos> = grid::inner_positions().collect();
    positions.shuffle(rng);
    positions
}

fn carve_caves(positions: &[Pos], grid: &mut Grid<Terrain>) {
    for &pos in positions {
        if count_floor_groups(pos, grid) != 1 {
            grid[pos] = Terrain::Floor;
        }
    }
}

pub fn count_neighbor_groups<T: Copy, F>(pos: Pos, grid: &Grid<T>, predicate: F) -> i32
where
    F: Fn(T) -> bool,
{
    let mut group_count = 0;
    let neighbors: Vec<Pos> = pos.neighbors().collect();
    let neighbor_pairs = util::self_zip(&neighbors);
    for &(curr_pos, next_pos) in &neighbor_pairs {
        if predicate(grid[curr_pos]) && !predicate(grid[next_pos]) {
            group_count += 1;
        }
    }
    if group_count > 0 {
        group_count
    } else if predicate(grid[neighbors[0]]) {
        1
    } else {
        0
    }
}

pub fn count_floor_groups(pos: Pos, grid: &Grid<Terrain>) -> i32 {
    count_neighbor_groups(pos, grid, |terrain| terrain == Terrain::Floor)
}

pub fn count_neighbors<T: Copy, F>(pos: Pos, level: &Grid<T>, predicate: F) -> usize
where
    F: Fn(T) -> bool,
{
    pos.neighbors().filter(|&pos| predicate(level[pos])).count()
}

/// Selectively remove walls near the edges of the map.
///
/// We do this because the edges of the map tend to have less open space. To
/// encourage better use of the whole map, wall tiles that are part of the outer
/// group of walls and that block two floor tiles from connecting get turned
/// into floor tiles.
fn connect_edges(positions: &[Pos], grid: &mut Grid<Terrain>) {
    let outer_wall = flood(grid::corner(), |pos| grid[pos] == Terrain::Wall, true);
    for &pos in positions {
        let is_floor = |t| t == Terrain::Floor;
        if outer_wall.contains(&pos)
            && count_floor_groups(pos, grid) == 2
            && count_neighbors(pos, grid, is_floor) == 2
        {
            grid[pos] = Terrain::Floor;
        }
    }
}

/// Remove groups of 5 walls or less.
fn remove_isolated_walls(grid: &mut Grid<Terrain>) {
    let outer_wall = flood(grid::corner(), |pos| grid[pos] == Terrain::Wall, true);
    let mut visited = Grid::new(|pos| outer_wall.contains(&pos));

    for pos in grid::positions() {
        if visited[pos] {
            continue;
        }
        let wall_positions = flood(pos, |pos| grid[pos] == Terrain::Wall, false);
        for &pos in &wall_positions {
            visited[pos] = true;
        }
        if wall_positions.len() < MIN_WALL_SIZE {
            for pos in wall_positions {
                grid[pos] = Terrain::Floor;
            }
        }
    }
}

/// Remove all but the largest group of floor tiles.
fn remove_isolated_floors(grid: &mut Grid<Terrain>) {
    let mut largest_floor_set = HashSet::new();
    for pos in grid::inner_positions() {
        if grid[pos] == Terrain::Floor {
            let floor_set = flood(pos, |pos| grid[pos] == Terrain::Floor, false);
            for &pos in &floor_set {
                grid[pos] = Terrain::Wall;
            }
            if floor_set.len() > largest_floor_set.len() {
                largest_floor_set = floor_set;
            }
        }
    }
    for pos in largest_floor_set {
        grid[pos] = Terrain::Floor;
    }
}

/// Remove caves of less than 4 tiles in size.
fn remove_small_caves(grid: &mut Grid<Terrain>) {
    let mut visited = Grid::new(|_pos| false);
    for pos in grid::inner_positions() {
        fill_dead_end(pos, grid);
        let flooded = flood(
            pos,
            &|pos: Pos<i32>| !visited[pos] && is_cave(pos, grid),
            true,
        );
        if flooded.len() >= MIN_CAVE_SIZE {
            for pos in flooded {
                visited[pos] = true;
            }
        } else if flooded.len() > 1 {
            grid[pos] = Terrain::Wall;
            for pos in flooded {
                fill_dead_end(pos, grid);
            }
        }
    }
}

fn fill_dead_end(pos: Pos, grid: &mut Grid<Terrain>) {
    if is_dead_end(pos, grid) {
        grid[pos] = Terrain::Wall;
        for neighbor in pos.neighbors() {
            fill_dead_end(neighbor, grid);
        }
    }
}

fn is_dead_end(pos: Pos, grid: &Grid<Terrain>) -> bool {
    is_cave(pos, grid) && pos.neighbors().all(|pos| !is_cave(pos, grid))
}

pub(super) fn is_cave(pos: Pos<i32>, grid: &Grid<Terrain>) -> bool {
    grid[pos] == Terrain::Floor && count_floor_groups(pos, grid) == 1
}

#[cfg(test)]
mod tests {
    use super::*;

    use grid;
    use rand::thread_rng;

    #[test]
    fn test_no_dead_ends() {
        let grid = generate(&mut thread_rng());
        for pos in grid::positions() {
            assert!(!is_dead_end(pos, &grid));
        }
    }

    #[test]
    fn test_connected() {
        let grid = generate(&mut thread_rng());
        let floor_pos = grid::positions()
            .find(|&pos| grid[pos] == Terrain::Floor)
            .unwrap();
        let cave = flood(floor_pos, |pos| grid[pos] == Terrain::Floor, false);
        assert!(grid::positions().all(|pos| grid[pos] == Terrain::Wall || cave.contains(&pos)));
    }
}
