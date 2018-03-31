//! Generate a level of only wall and floor tiles.

use rand::{XorShiftRng, SeedableRng, Rng};

use util;
use util::floodfill;
use util::grid::{Pos, Grid};

use std::collections::HashMap;

#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Tile {
    Wall, Floor
}

pub fn generate(width: usize, height: usize, seed: [u32; 4]) -> Grid<Tile> {
    let mut grid = Grid::new(width, height, |_i, _pos| Tile::Wall);
    let mut rng: XorShiftRng = SeedableRng::from_seed(seed);
    let inner_indices = calc_shuffled_inner_indices(&grid, &mut rng);
    carve_caves(&inner_indices, &mut grid);
    // remove_isolated_walls(&mut grid);
    remove_small_caves(&mut grid);
    grid
}

fn calc_inner_indices<T>(grid: &Grid<T>) -> Vec<usize> {
    let area = (grid.width - 2) * (grid.height - 2);
    let mut indices = Vec::with_capacity(area as usize);
    for y in 1..grid.height - 1 {
        for x in 1..grid.width - 1 {
            indices.push(y * grid.width + x);
        }
    }
    indices
}

fn calc_shuffled_inner_indices<T, R: Rng>(grid: &Grid<T>, rng: &mut R) -> Vec<usize> {
    let mut indices = calc_inner_indices(grid);
    rng.shuffle(&mut indices);
    indices
}

fn carve_caves(indices: &Vec<usize>, grid: &mut Grid<Tile>) {
    for &i in indices {
        let pos = grid.linear_to_pos(i);
        if count_floor_groups(pos, grid) != 1 {
            grid[i] = Tile::Floor;
        }
    }
}

fn count_floor_groups(pos: Pos, grid: &Grid<Tile>) -> i32 {
    let mut group_count = 0;
    let neighbors = pos.neighbors();
    let neighbor_pairs = util::self_zip(&neighbors);
    for &(curr_pos, next_pos) in &neighbor_pairs {
        if grid[curr_pos] == Tile::Wall && grid[next_pos] == Tile::Floor {
            group_count += 1;
        }
    }
    if group_count > 0 {
        group_count
    } else if grid[neighbors[0]] == Tile::Floor {
        1
    } else {
        0
    }
}

/// Remove groups of 5 walls or less.
fn remove_isolated_walls(grid: &mut Grid<Tile>) {
    let (sizes, flooded) = count_group_sizes(grid, &|a, b| grid[a] == grid[b]);
    for pos in grid.positions() {
        let id = flooded[pos] as usize;
        if sizes[id] <= 5 && grid[pos] == Tile::Wall {
            grid[pos] = Tile::Floor;
        }
    }
}

/// Remove caves of less than 4 tiles in size.
fn remove_small_caves(grid: &mut Grid<Tile>) {
    let (sizes, flooded) = count_group_sizes(grid, &|a, b| is_cave(a, grid) && is_cave(b, grid));
    for pos in grid.positions() {
        fill_dead_end(pos, grid);
        let id = flooded[pos] as usize;
        if sizes[id] == 2 || sizes[id] == 3 {
            grid[pos] = Tile::Wall;
        }
    }
}

fn count_group_sizes<F>(grid: &Grid<Tile>, equiv: &F) -> (Vec<u32>, Grid<u32>)
        where F: Fn(Pos, Pos) -> bool {
    let (count, mut flooded) = floodfill::flood_all(grid, equiv);
    let mut sizes = vec![0; count as usize];
    for mut id in flooded.iter_mut() {
        *id -= 1;
        sizes[*id as usize] += 1;
    }
    (sizes, flooded)
}

fn fill_dead_end(pos: Pos, grid: &mut Grid<Tile>) {
    if is_dead_end(pos, grid) {
        grid[pos] = Tile::Wall;
        for neighbor in pos.neighbors() {
            fill_dead_end(pos, grid);
        }
    }
}

fn is_dead_end(pos: Pos, grid: &Grid<Tile>) -> bool {
    is_cave(pos, grid) && pos.neighbors().iter().all(|&pos| !is_cave(pos, grid))
}

fn is_cave(pos: Pos, grid: &Grid<Tile>) -> bool {
    grid[pos] == Tile::Floor && count_floor_groups(pos, grid) == 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_dead_ends() {
        let grid = generate(40, 40, [1, 2, 3, 4]);
        for pos in grid.positions() {
            assert!(!is_dead_end(pos, &grid));
        }
    }

    fn on_outer_edge<T>(pos: Pos, grid: &Grid<T>) -> bool {
        grid.contains(pos) && pos.neighbors().iter().any(|&pos| !grid.contains(pos))
    }

    #[test]
    fn test_calc_inner_indicies() {
        let grid = Grid::new(40, 40, |_i, _pos| false);
        let indices = calc_inner_indices(&grid);
        let positions: Vec<Pos> = indices.iter().map(|&i| grid.linear_to_pos(i)).collect();
        assert!(positions.iter().all(|&pos| !on_outer_edge(pos, &grid)));
    }
}
