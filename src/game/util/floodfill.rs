//! Function for performing an efficient floodfill.

use crate::prelude::*;
use std::collections::HashSet;

/// Performs a floodfill starting at origin.
///
/// Positions are flooded if they are connected to the origin and floodable(pos) returns true.
pub fn flood<F>(origin: Pos, floodable: F, check_bounds: bool) -> HashSet<Pos>
where
    F: Fn(Pos) -> bool,
{
    let floodable = |pos| (!check_bounds || grid::contains(pos)) && floodable(pos);
    let mut flooded = HashSet::new();
    if !floodable(origin) {
        return flooded;
    }
    flooded.insert(origin);
    for &direction in &DIRECTIONS {
        flood_stem(origin, direction, &mut flooded, &floodable);
    }
    flooded
}

fn flood_stem<F>(origin: Pos, direction: Direction, flooded: &mut HashSet<Pos>, floodable: &F)
where
    F: Fn(Pos) -> bool,
{
    for y in 1.. {
        let pos = origin + direction * y;
        if !floodable(pos) || flooded.contains(&pos) {
            break;
        }
        flooded.insert(pos);
        flood_leaf(pos, direction.rotate(1), flooded, floodable);
        flood_leaf(pos, direction.rotate(-1), flooded, floodable);
    }
}

fn flood_leaf<F>(origin: Pos, direction: Direction, flooded: &mut HashSet<Pos>, floodable: &F)
where
    F: Fn(Pos) -> bool,
{
    for x in 1.. {
        let pos = origin + direction * x;
        if !floodable(pos) || flooded.contains(&pos) {
            break;
        }
        flooded.insert(pos);
        recur(pos, direction, true, flooded, floodable);
        recur(pos, direction, false, flooded, floodable);
    }
}

fn recur<F>(
    pos: Pos,
    direction: Direction,
    reverse: bool,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) where
    F: Fn(Pos) -> bool,
{
    let sign = if reverse { -1 } else { 1 };
    let passable = |pos, flooded: &HashSet<Pos>| floodable(pos) && !flooded.contains(&pos);
    let corner = pos + direction.rotate(-sign * 2);
    let turn = direction.rotate(-sign);
    if !passable(corner, flooded) && passable(pos + turn, flooded) {
        flood_stem(pos, turn, flooded, floodable);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::game::grid::{self, Grid};
    use rand::{thread_rng, Rng};

    /// Naive recursive floodfill used to compare against the scanline floodfill.
    fn basic_flood<F>(origin: Pos, floodable: F) -> HashSet<Pos>
    where
        F: Fn(Pos) -> bool,
    {
        let mut flooded = HashSet::new();
        basic_flood_helper(origin, &mut flooded, &floodable);
        flooded
    }

    /// Recursive helper for the naive floodfill.
    fn basic_flood_helper<F>(pos: Pos, flooded: &mut HashSet<Pos>, floodable: &F)
    where
        F: Fn(Pos) -> bool,
    {
        if floodable(pos) && !flooded.contains(&pos) {
            flooded.insert(pos);
            for neighbor in pos.neighbors() {
                basic_flood_helper(neighbor, flooded, floodable);
            }
        }
    }

    /// Test whether two hashsets contain the same items.
    fn set_equiv(a: &HashSet<Pos>, b: &HashSet<Pos>) -> bool {
        a.len() == b.len() && a.iter().all(|item| b.contains(item))
    }

    /// Make sure naive floodfill and the efficient floodfill behave the same.
    #[test]
    fn flood_equiv_basic_flood() {
        let mut rng = thread_rng();
        for _i in 0..40 {
            let grid: Grid<bool> = Grid::new(|_pos| rng.gen_bool(0.75));
            let normal_set = flood(grid::center(), |pos| grid[pos], true);
            let basic_set = basic_flood(grid::center(), |pos| grid::contains(pos) && grid[pos]);
            assert!(set_equiv(&normal_set, &basic_set));
        }
    }
}
