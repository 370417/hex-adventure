use grid::{Grid, Pos};
use super::basic;
use super::tile::Terrain;

use rand::Rng;

pub(super) fn add_exit<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) -> Grid<Terrain> {
    let mut positions = level.inner_positions();
    rng.shuffle(&mut positions);
    loop {
        let mut next_level = basic::generate(level.width, level.height, rng);
        if let Some(pos) = find_exit(level, &next_level, &positions) {
            level[pos] = Terrain::Exit;
            next_level[pos] = Terrain::Entrance;
            break next_level;
        }
    }
}

fn find_exit(
    level: &Grid<Terrain>,
    next_level: &Grid<Terrain>,
    positions: &Vec<Pos>,
) -> Option<Pos> {
    for &pos in positions {
        if is_valid_exit(pos, level) && is_valid_exit(pos, next_level) {
            return Some(pos);
        }
    }
    None
}

fn is_valid_exit(pos: Pos, level: &Grid<Terrain>) -> bool {
    level[pos] == Terrain::Wall && basic::count_floor_groups(pos, level) == 1
}
