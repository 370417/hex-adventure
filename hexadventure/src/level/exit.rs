use super::basic;
use super::tile::Terrain;
use grid::{self, Grid, Pos};
use rand::Rng;

pub(super) fn add_exit<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) -> Grid<Terrain> {
    let mut positions: Vec<Pos> = grid::inner_positions().collect();
    rng.shuffle(&mut positions);
    loop {
        let next_level = basic::generate(rng);
        if let Some(exit_pos) = find_exit(level, &next_level, &positions) {
            level[exit_pos] = Terrain::Exit;
            break Grid::new(|pos| {
                if pos == exit_pos {
                    Terrain::Entrance
                } else {
                    Terrain::from(next_level[pos])
                }
            });
        }
    }
}

fn find_exit(
    level: &Grid<Terrain>,
    next_level: &Grid<basic::Terrain>,
    positions: &[Pos],
) -> Option<Pos> {
    for &pos in positions {
        if is_valid_exit(pos, level) && is_valid_entrance(pos, next_level) {
            return Some(pos);
        }
    }
    None
}

fn is_valid_exit(pos: Pos, level: &Grid<Terrain>) -> bool {
    level[pos] == Terrain::Wall
        && basic::count_neighbor_groups(pos, level, |t| t != Terrain::Wall) == 1
        && count_neighbors(pos, level, |t| t == Terrain::Wall) == 4
        && count_neighbors(pos, level, |t| t == Terrain::Entrance) == 0
}

fn is_valid_entrance(pos: Pos, level: &Grid<basic::Terrain>) -> bool {
    level[pos] == basic::Terrain::Wall && basic::count_floor_groups(pos, level) == 1
        && count_neighbors(pos, level, |t| t == basic::Terrain::Wall) == 4
}

fn count_neighbors<T: Copy, F>(pos: Pos, level: &Grid<T>, predicate: F) -> usize
where
    F: Fn(T) -> bool,
{
    pos.neighbors().filter(|&pos| predicate(level[pos])).count()
}
