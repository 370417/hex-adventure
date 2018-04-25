use grid::{Grid, Pos};
use level::basic;
use level::tile::Tile;

use rand::Rng;

pub fn add_exit<R: Rng>(level: &mut Grid<Tile>, rng: &mut R) -> Grid<Tile> {
    loop {
        let next_seed = rng.gen();
        let mut next_level = basic::generate(level.width, level.height, next_seed);
        if let Some(pos) = find_exit(level, &next_level) {
            level[pos] = Tile::Exit;
            next_level[pos] = Tile::Entrance;
            break next_level;
        }
    }
}

fn find_exit(level: &Grid<Tile>, next_level: &Grid<Tile>) -> Option<Pos> {
    for pos in level.inner_positions() {
        if is_valid_exit(pos, level) && is_valid_exit(pos, next_level) {
            return Some(pos);
        }
    }
    None
}

fn is_valid_exit(pos: Pos, level: &Grid<Tile>) -> bool {
    level[pos] == Tile::Wall && basic::count_floor_groups(pos, level) == 1
}
