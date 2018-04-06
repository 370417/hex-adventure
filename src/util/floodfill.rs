use util::grid::{Grid, Pos};

pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
    flood_helper(origin, &floodable, &mut flooded);
    flooded
}

pub fn flood_with_size<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> (u32, Grid<bool>)
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
    let size = flood_with_size_helper(origin, &floodable, &mut flooded);
    (size, flooded)
}

pub fn flood_all<F, T>(grid: &Grid<T>, equiv: &F) -> (u32, Grid<u32>)
        where F: Fn(Pos, Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| 0u32);
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
        let mut grid = Grid::new(40, 40, |_pos| false);
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
        let grid = Grid::new(40, 40, |_pos| false);
        let (count, flooded) = flood_all(&grid, &|_a, _b| true);
        assert_eq!(count, 1);
        assert!(flooded.into_iter().all(|id| id == 1));
    }
}

// pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
//         where F: Fn(Pos) -> bool {
//     let flooded = Grid::new(grid.width, grid.height, |_i, _pos| false);
//     let row = Row::from_pos(origin, grid, floodable);

// }

// pub fn flood_north<F, T>(row: &Row, grid: &Grid<T>, floodable: &F) -> Grid<bool>
//         where F: Fn(Pos) -> bool {
//     let new_row = Row::from_southern_row(row, grid);

// }

// struct Row {
//     x_min: i32,
//     x_max: i32,
//     xy: i32,
// }

// impl Row {
//     fn from_pos<T, F>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Self
//             where F: Fn(Pos) -> bool {
//         let xy = origin.x + origin.y;
//         if !floodable(origin) {
//             return Row {
//                 x_min: origin.x,
//                 x_max: origin.x,
//                 xy,
//             }
//         }
//         let mut east_edge = origin + Direction::East;
//         let mut west_edge = origin + Direction::West;
//         while grid.contains(east_edge) && floodable(east_edge) {
//             east_edge += Direction::East;
//         }
//         while grid.contains(west_edge) && floodable(west_edge) {
//             west_edge += Direction::West;
//         }
//         Row {
//             x_min: west_edge.x + 1,
//             x_max: east_edge.x,
//             xy,
//         }
//     }

//     fn from_southern_row<T>(row: &Row, grid: &Grid<T>) -> Option<Self> {
//         let new_row = Row {
//             x_min: row.x_min + Direction::Northwest.x(),
//             x_max: row.x_max + Direction::Northeast.x(),
//             xy: row.xy + Direction::Northeast.x() + Direction::Northeast.y(),
//         };
//         new_row.trimmed(grid)
//     }

//     fn from_northern_row<T>(row: &Row, grid: &Grid<T>) -> Option<Self> {
//         let new_row = Row {
//             x_min: row.x_min + Direction::Southwest.x(),
//             x_max: row.x_max + Direction::Southeast.x(),
//             xy: row.xy + Direction::Southeast.x() + Direction::Southeast.y(),
//         };
//         new_row.trimmed(grid)
//     }

//     fn flood_horizontal

//     fn trimmed<T>(self, grid: &Grid<T>) -> Option<Self> {
//         let west_edge = self.pos(self.x_min);
//         let east_edge = self.pos(self.x_max);
//         match (grid.contains(west_edge), grid.contains(east_edge)) {
//             (true, true) => Some(self),
//             (true, false) => Some(Row { x_max: self.x_max - 1, ..self }),
//             (false, true) => Some(Row { x_min: self.x_min + 1, ..self }),
//             (false, false) => None,
//         }
//     }

//     fn pos(&self, x: i32) -> Pos {
//         Pos {
//             x,
//             y: self.xy - x,
//         }
//     }

//     fn positions(&self) -> Vec<Pos> {
//         (self.x_min..self.x_max).map(|x| {
//             let y = self.xy - x;
//             Pos { x, y }
//         }).collect()
//     }
// }
