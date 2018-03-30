//! Generate a level of only wall and floor.

use rand::{XorShiftRng, SeedableRng, Rng};

use util;
use util::floodfill;
use util::grid::{Pos, Grid};

#[derive(PartialEq, Eq, Debug, Copy, Clone)]
enum Tile {
    Wall, Floor
}

pub fn generate(width: usize, height: usize, seed: [u32; 4]) {
    let mut grid = Grid::new(width, height, |_i, _pos| Tile::Wall);
    let mut rng: XorShiftRng = SeedableRng::from_seed(seed);
    let inner_indices = calc_shuffled_inner_indices(&grid, &mut rng);
    carve_caves(&inner_indices, &mut grid);
    remove_isolated_walls(&mut grid);
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
    let flooded = floodfill::flood_all(grid, &|a, b| grid[a] == grid[b]);
}
