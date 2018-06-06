use super::basic;
use super::tile::Terrain;
use floodfill::flood;
use grid::{self, Grid, Pos};
use rand::Rng;

const MIN_LAKE_SIZE: usize = 10;
const MIN_WALL_SIZE: usize = 4;

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
    let mut level_size = flood(exit_pos, |pos| floodable(pos, &level)).len();
    let mut tries = 0;
    let mut lake_count = 0;
    while tries + lake_count < 5 {
        tries += 1;
        let mut lake_level = basic::generate(rng);
        for pos in grid::inner_positions() {
            let lake = flood(pos, |pos| basic::is_cave(pos, &lake_level));
            let mut lake_floor_size = 0;
            for &pos in &lake {
                lake_level[pos] = basic::Terrain::Wall;
                if level[pos] == Terrain::Floor {
                    lake_floor_size += 1;
                }
            }
            if lake_floor_size == 0 {
                continue;
            }
            let level_size_with_lake = flood(exit_pos, |pos| {
                floodable(pos, &level) && !lake.contains(&pos)
            }).len();
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
    remove_isolated_walls(level);
}

fn floodable(pos: Pos, level: &Grid<Terrain>) -> bool {
    match level[pos] {
        Terrain::Floor | Terrain::Entrance | Terrain::Exit => true,
        _ => false,
    }
}

fn remove_isolated_walls(grid: &mut Grid<Terrain>) {
    let outer_wall = flood(grid::corner(), |pos| {
        grid::contains(pos) && grid[pos] == Terrain::Wall
    });
    let mut visited = Grid::new(|pos| outer_wall.contains(&pos));
    for pos in grid::positions() {
        if visited[pos] {
            continue;
        }
        let wall_positions = flood(pos, |pos| grid::contains(pos) && grid[pos] == Terrain::Wall);
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
