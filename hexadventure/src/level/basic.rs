//! Generate a connected level of only wall and floor tiles.

use rand::{IsaacRng, Rng};

use util;
use util::floodfill;
use util::grid::{Grid, Pos};

use level::tile::Tile;

use std::collections::HashSet;

pub fn generate(width: usize, height: usize, seed: u64) -> Grid<Tile> {
    let mut grid = Grid::new(width, height, |_pos| Tile::Wall);
    let mut rng = IsaacRng::new_from_u64(seed);
    let positions = calc_shuffled_positions(&grid, &mut rng);
    carve_caves(&positions, &mut grid);
    remove_isolated_walls(&mut grid);
    remove_isolated_floors(&mut grid);
    remove_small_caves(&mut grid);
    grid
}

fn calc_shuffled_positions<T, R: Rng>(grid: &Grid<T>, rng: &mut R) -> Vec<Pos> {
    let mut positions = grid.inner_positions();
    rng.shuffle(&mut positions);
    positions
}

fn carve_caves(positions: &[Pos], grid: &mut Grid<Tile>) {
    for &pos in positions {
        if count_floor_groups(pos, grid) != 1 {
            grid[pos] = Tile::Floor;
        }
    }
}

pub fn count_floor_groups(pos: Pos, grid: &Grid<Tile>) -> i32 {
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
    for pos in grid.positions() {
        let wall_positions =
            floodfill::flood(pos, |pos| grid.contains(pos) && grid[pos] == Tile::Wall);
        if wall_positions.len() <= 5 {
            for pos in wall_positions {
                grid[pos] = Tile::Floor;
            }
        }
    }
}

/// Remove all but the largest group of floor tiles.
fn remove_isolated_floors(grid: &mut Grid<Tile>) {
    let mut largest_floor_set = HashSet::new();
    for pos in grid.positions() {
        if grid[pos] == Tile::Floor {
            let floor_set = floodfill::flood(pos, |pos| grid[pos] == Tile::Floor);
            for &pos in floor_set.iter() {
                grid[pos] = Tile::Wall;
            }
            if floor_set.len() > largest_floor_set.len() {
                largest_floor_set = floor_set;
            }
        }
    }
    for pos in largest_floor_set {
        grid[pos] = Tile::Floor;
    }
}

/// Remove caves of less than 4 tiles in size.
fn remove_small_caves(grid: &mut Grid<Tile>) {
    let mut visited = Grid::new(grid.width, grid.height, |_pos| false);
    for pos in grid.positions() {
        fill_dead_end(pos, grid);
        let flooded = floodfill::flood(pos, &|pos| {
            grid.contains(pos) && !visited[pos] && is_cave(pos, grid)
        });
        if flooded.len() > 3 {
            for pos in flooded {
                visited[pos] = true;
            }
        } else if flooded.len() == 3 || flooded.len() == 2 {
            grid[pos] = Tile::Wall;
            for pos in flooded {
                fill_dead_end(pos, grid);
            }
        }
    }
}

fn fill_dead_end(pos: Pos, grid: &mut Grid<Tile>) {
    if is_dead_end(pos, grid) {
        grid[pos] = Tile::Wall;
        for neighbor in pos.neighbors() {
            fill_dead_end(neighbor, grid);
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

    #[test]
    fn test_connected() {
        let grid = generate(40, 40, [1, 2, 3, 4]);
        let floor_pos = *grid.positions()
            .iter()
            .find(|&&pos| grid[pos] == Tile::Floor)
            .unwrap();
        let cave = floodfill::flood(floor_pos, |pos| grid[pos] == Tile::Floor);
        assert!(
            grid.positions()
                .iter()
                .all(|&pos| grid[pos] == Tile::Wall || cave.contains(&pos))
        );
    }
}
