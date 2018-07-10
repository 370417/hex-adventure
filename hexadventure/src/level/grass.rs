use super::basic::calc_shuffled_positions;
use super::tile::Terrain;
use fov::calc_fov;
use grid::{Grid, Pos};
use rand::Rng;

pub(super) fn add_grass<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) {
    let positions = calc_shuffled_positions(rng);
    for &pos in &positions {
        if level[pos] == Terrain::Floor {
            let fov_size = calc_fov_size(level, pos);
            if fov_size > 60 {
                level[pos] = Terrain::ShortGrass;
            }
        }
    }
}

fn calc_fov_size(level: &mut Grid<Terrain>, pos: Pos) -> u32 {
    let transparent = |pos| match level[pos] {
        Terrain::Floor | Terrain::ShortGrass | Terrain::TallGrass => true,
        _ => false,
    };
    let mut fov_size = 0;
    calc_fov(pos, transparent, |_| fov_size += 1);
    fov_size
}
