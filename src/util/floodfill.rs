use util::grid::{Grid, Pos, Direction};
use std::iter::{Iterator, IntoIterator};

pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_i, _pos| false);
    flood_helper(origin, &floodable, &mut flooded);
    flooded
}

pub fn flood_with_size<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> (u32, Grid<bool>)
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_i, _pos| false);
    let size = flood_with_size_helper(origin, &floodable, &mut flooded);
    (size, flooded)
}

pub fn flood_all<F, T>(grid: &Grid<T>, equiv: &F) -> (u32, Grid<u32>)
        where F: Fn(Pos, Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_i, _pos| 0u32);
    let mut count = 0;
    for pos in grid.positions() {
        if flooded[pos] == 0 {
            count += 1;
            flooded[pos] = count;
            flood_all_helper(pos, equiv, &mut flooded, count);
        }
    }
    (count, flooded)
}

fn flood_helper<F>(pos: Pos, floodable: &F, flooded: &mut Grid<bool>)
        where F: Fn(Pos) -> bool {
    if flooded.contains(pos) && !flooded[pos] && floodable(pos) {
        flooded[pos] = true;
        for neighbor in pos.neighbors() {
            flood_helper(neighbor, floodable, flooded);
        }
    }
}

fn flood_with_size_helper<F>(pos: Pos, floodable: &F, flooded: &mut Grid<bool>) -> u32
        where F: Fn(Pos) -> bool {
    let mut size = 0u32;
    if flooded.contains(pos) && !flooded[pos] && floodable(pos) {
        flooded[pos] = true;
        size += 1;
        for neighbor in pos.neighbors() {
            size += flood_with_size_helper(neighbor, floodable, flooded);
        }
    }
    size
}

fn flood_all_helper<F>(pos: Pos, equiv: &F, flooded: &mut Grid<u32>, count: u32)
        where F: Fn(Pos, Pos) -> bool {
    for neighbor in pos.neighbors() {
        if flooded.contains(neighbor) && flooded[neighbor] == 0 && equiv(pos, neighbor) {
            flooded[neighbor] = count;
            flood_all_helper(neighbor, equiv, flooded, count);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::{Rng, thread_rng};

    #[test]
    fn test_flood_all_is_complete() {
        let mut rng = thread_rng();
        let mut grid = Grid::new(40, 40, |_i, _pos| false);
        for b in grid.iter_mut() {
            *b = rng.gen();
        }
        let (count, flooded) = flood_all(&grid, &|a, b| a == b);
        for id in flooded {
            assert!(id > 0);
            assert!(id <= count);
        }
    }

    #[test]
    fn test_flood_all() {
        let mut grid = Grid::new(40, 40, |_i, _pos| false);
        let (count, flooded) = flood_all(&grid, &|a, b| true);
        assert_eq!(count, 1);
        assert!(flooded.into_iter().all(|id| id == 1));
    }
}

// struct Row {
//     x_min: i32,
//     x_max: i32,
//     xy: i32,
// }

// impl Row {
//     fn from_pos(origin: Pos) {
//         let xy = origin.x + origin.y;
//     }
// }

// enum FloodDirection {
//     North, South
// }

// impl FloodDirection {
//     fn opposite(&self) -> Self {
//         match *self {
//             FloodDirection::North => FloodDirection::South,
//             FloodDirection::South => FloodDirection::North,
//         }
//     }

//     fn east(&self) -> Direction {
//         match *self {
//             FloodDirection::North => Direction::Northeast,
//             FloodDirection::South => Direction::Southeast,
//         }
//     }

//     fn west(&self) -> Direction {
//         match *self {
//             FloodDirection::North => Direction::Northwest,
//             FloodDirection::South => Direction::Southwest,
//         }
//     }
// }

// pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F)
//         where F: Fn(Pos) -> bool {
//     if !floodable(origin) {
//         return;
//     }
//     let mut flooded = Grid::new(grid.width, grid.height, |i, pos| false);
//     flooded[origin] = true;
//     let mut east_front = origin + Direction::East;
//     while grid.contains(east_front) && floodable(east_front) {
//         flooded[east_front] = true;
//         east_front += Direction::East;
//     }
//     let mut west_front = origin + Direction::West;
//     while grid.contains(west_front) && floodable(west_front) {
//         flooded[west_front] = true;
//         west_front += Direction::West;
//     }
//     if grid.contains(east_front + Direction::Northwest) {
//         flood_line(
//             Row::new(
//                 east_front + Direction::Northeast,
//                 west_front + Direction::Northwest,
//             ),
//             FloodDirection::North,
//             &grid,
//             &floodable,
//             &mut flooded,
//         );
//     }
//     if grid.contains(east_front + Direction::Southwest) {
//         flood_line(
//             Row::new(
//                 east_front + Direction::Southeast,
//                 west_front + Direction::Southwest,
//             ),
//             FloodDirection::South,
//             &grid,
//             &floodable,
//             &mut flooded,
//         )
//     }
// }

// /// A horizontal line segment of positions.
// struct Row {
//     east_edge: Pos,
//     west_edge: Pos,
// }

// struct RowIterator {
//     east_edge: Pos,
//     length: u32,
//     progress: u32,
// }

// impl Row {
//     fn new(east_edge: Pos, west_edge: Pos) -> Self {
//         Row {
//             east_edge,
//             west_edge,
//         }
//     }
// }

// impl IntoIterator for Row {
//     type Item = Pos;
//     type IntoIter = RowIterator;

//     fn into_iter(self) -> Self::IntoIter {
//         RowIterator {
//             east_edge: self.east_edge,
//             length: (self.east_edge - self.west_edge).distance(),
//             progress: 0,
//         }
//     }
// }

// impl Iterator for RowIterator {
//     type Item = Pos;

//     fn next(&mut self) -> Option<Self::Item> {
//         if self.progress > self.length {
//             None
//         } else {
//             Some(self.east_edge + Direction::West * self.progress)
//         }
//     }
// }

// fn flood_line<F, T>(mut row: Row, direction: FloodDirection, grid: &Grid<T>, floodable: &F, mut flooded: &mut Grid<bool>)
//         where F: Fn(Pos) -> bool {
//     if !grid.contains(row.east_edge) {
//         row.east_edge += Direction::West;
//     }
//     if !grid.contains(row.west_edge) {
//         row.west_edge += Direction::East;
//     }
//     let mut easternmost_floodable = if floodable(row.east_edge) {
//         let mut east_front = row.east_edge + Direction::East;
//         while grid.contains(east_front) && floodable(east_front) && !flooded[east_front] {
//             flooded[east_front] = true;
//             east_front += Direction::East;
//         }
//         flood_line(
//             Row::new(
//                 row.east_front + direction.east(),
//                 row.east_edge + direction.east() + Direction::East,
//             ),
//             direction.opposite(),
//             &grid,
//             &floodable,
//             &mut flooded,
//         );
//         Some(east_front)
//     } else {
//         None
//     };
//     for pos in row {

//     }
// }
