//! Function for performing an efficient floodfill.

use grid::{Direction, Pos, DIRECTIONS};
use std::collections::HashSet;

/// Performs a floodfill starting at origin.
///
/// Positions are flooded if they are connected to the origin and floodable(pos) returns true.
pub fn flood<F>(origin: Pos, floodable: F) -> HashSet<Pos>
where
    F: Fn(Pos) -> bool,
{
    let mut flooded = HashSet::new();
    if !floodable(origin) {
        return flooded;
    }
    flooded.insert(origin);
    for &direction in DIRECTIONS.iter() {
        flood_stem(origin + direction, direction, &mut flooded, &floodable);
    }
    // flood_stem(origin, Direction::East, &mut flooded, &floodable);
    // flood_stem(origin + Direction::West, Direction::Northwest, &mut flooded, &floodable);
    // flood_stem(origin + Direction::Southwest, Direction::Southwest, &mut flooded, &floodable);
    flooded
}
// pub fn flood<F>(origin: Pos, floodable: F) -> HashSet<Pos>
// where
//     F: Fn(Pos) -> bool,
// {
//     let mut flooded = HashSet::new();
//     if !floodable(origin) {
//         return flooded;
//     }
//     flooded.insert(origin);
//     for &direction in DIRECTIONS.iter() {
//         flood_sextant(origin, direction, Chirality::Clockwise, &mut flooded, &floodable);
//     }
//     flooded
// }

fn flood_stem<F>(origin: Pos, direction: Direction, flooded: &mut HashSet<Pos>, floodable: &F)
where
    F: Fn(Pos) -> bool,
{
    for y in 0.. {
        let pos = origin + direction * y;
        if !floodable(pos) || flooded.contains(&pos) {
            break;
        }
        flooded.insert(pos);
        let right = direction.rotate(1);
        let left = direction.rotate(-1);
        flood_leaf(pos + right, right, flooded, floodable);
        flood_leaf(pos + left, left, flooded, floodable);
    }
}

fn flood_leaf<F>(origin: Pos, direction: Direction, flooded: &mut HashSet<Pos>, floodable: &F)
where
    F: Fn(Pos) -> bool,
{
    let passable = |pos, flooded: &HashSet<Pos>| floodable(pos) && !flooded.contains(&pos);
    for x in 0.. {
        let pos = origin + direction * x;
        if !passable(pos, flooded) {
            break;
        }
        flooded.insert(pos);
        if !passable(pos + direction.rotate(2), flooded)
            && passable(pos + direction.rotate(1), flooded)
        {
            flood_stem(
                pos + direction.rotate(1),
                direction.rotate(1),
                flooded,
                floodable,
            );
        }
        if !passable(pos + direction.rotate(-2), flooded)
            && passable(pos + direction.rotate(-1), flooded)
        {
            flood_stem(
                pos + direction.rotate(-1),
                direction.rotate(-1),
                flooded,
                floodable,
            );
        }
    }
}

fn flood_sextant<F>(
    origin: Pos,
    direction: Direction,
    chirality: Chirality,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) where
    F: Fn(Pos) -> bool,
{
    let passable = |pos, flooded: &HashSet<Pos>| floodable(pos) && !flooded.contains(&pos);
    let leaf_direction = rotate(direction, 1, chirality);
    for y in 1.. {
        let stem_pos = origin + direction * y;
        if !passable(stem_pos, flooded) {
            break;
        }
        flooded.insert(stem_pos);
        recur(stem_pos, direction, chirality, flooded, floodable);
        for x in 1.. {
            let leaf_pos = stem_pos + leaf_direction * x;
            if !passable(leaf_pos, flooded) {
                break;
            }
            flooded.insert(leaf_pos);
            recur(leaf_pos, leaf_direction, chirality, flooded, floodable);
            recur(
                leaf_pos,
                leaf_direction,
                chirality.opposite(),
                flooded,
                floodable,
            );
        }
    }
}

#[derive(Copy, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

impl Chirality {
    fn opposite(&self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}

/// Recursively call `flood_sextant` if there is a forced neighbor.
fn recur<F>(
    pos: Pos,
    direction: Direction,
    chirality: Chirality,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) where
    F: Fn(Pos) -> bool,
{
    let corner = pos + rotate(direction, -2, chirality);
    let turn = rotate(direction, -1, chirality);
    let passable = |pos, flooded: &HashSet<Pos>| floodable(pos) && !flooded.contains(&pos);
    if !passable(corner, flooded) && passable(pos + turn, flooded) {
        flood_sextant(pos, turn, chirality, flooded, floodable);
    }
}

fn rotate(direction: Direction, n: i32, chirality: Chirality) -> Direction {
    match chirality {
        Chirality::Clockwise => direction.rotate(n),
        Chirality::Counterclockwise => direction.rotate(-n),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use grid::Grid;
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

    /// Make sure naive floodfill and scanline floodfill behave the same.
    #[test]
    fn flood_equiv_basic_flood() {
        let mut rng = thread_rng();
        for _i in 0..40 {
            let grid: Grid<bool> = Grid::new(40, 40, |_pos| rng.gen_bool(0.75));
            let normal_set = flood(grid.center(), |pos| grid.contains(pos) && grid[pos]);
            let basic_set = basic_flood(grid.center(), |pos| grid.contains(pos) && grid[pos]);
            assert!(set_equiv(&normal_set, &basic_set));
        }
    }
}
