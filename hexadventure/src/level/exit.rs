use grid::{Grid, Pos};
use level::basic;
use level::tile::Terrain;

use rand::Rng;

pub fn add_exit<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) -> Grid<Terrain> {
    loop {
        let mut next_level = basic::generate(level.width, level.height, rng);
        if let Some(pos) = find_exit(level, &next_level) {
            level[pos] = Terrain::Exit;
            next_level[pos] = Terrain::Entrance;
            break next_level;
        }
    }
}

fn find_exit(level: &Grid<Terrain>, next_level: &Grid<Terrain>) -> Option<Pos> {
    for pos in level.inner_positions() {
        if is_valid_exit(pos, level) && is_valid_exit(pos, next_level) {
            return Some(pos);
        }
    }
    None
}

fn is_valid_exit(pos: Pos, level: &Grid<Terrain>) -> bool {
    level[pos] == Terrain::Wall && basic::count_floor_groups(pos, level) == 1
}
