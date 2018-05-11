//! Representation of a hexagonal grid.
//!
//! Uses axial coordinates.
//! This grid can be thought of as any plane in 3d space that is normal to the vector {1, 1, 1}.
//! The x-axis (of the hex grid, not of the 3d space) points in `Direction::Southeast`,
//! which is the vector {1, 0, -1} in 3d space.
//! The y-axis points in `Direction::Southwest`, which is the vector {0, 1, -1}.

use std::ops;

use line::Line;

pub const DIRECTIONS: [Direction; 6] = [
    Direction::Northeast,
    Direction::East,
    Direction::Southeast,
    Direction::Southwest,
    Direction::West,
    Direction::Northwest,
];

pub const WIDTH: usize = 40;
pub const HEIGHT: usize = 30;

#[derive(Serialize, Deserialize)]
pub struct Grid<T> {
    pub width: usize,
    pub height: usize,
    grid: Vec<T>,
}

/// A 2d index of a hexagonal grid.
///
/// Ranges from (0, 0) to (width-1, height-1).
#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
struct Index2d {
    row: usize,
    col: usize,
}

/// A position on a hexagonal grid in axial coordinates.
#[derive(PartialEq, Eq, Debug, Copy, Clone, Hash, Serialize, Deserialize)]
pub struct Pos {
    x: i32,
    y: i32,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub struct Displacement {
    x: i32,
    y: i32,
}

/// The location of a position as shown on screen.
pub struct Location {
    pub x: i32,
    pub y: i32,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub enum Direction {
    Southeast,
    East,
    Northeast,
    Northwest,
    West,
    Southwest,
}

impl Pos {
    pub fn neighbors(self) -> Vec<Pos> {
        DIRECTIONS
            .into_iter()
            .map(|&direction| self + direction)
            .collect()
    }

    pub fn distance(self, other: Pos) -> u32 {
        (other - self).distance()
    }

    pub fn to(self, target: Pos) -> Line {
        Line {
            start: self,
            end: target,
        }
    }
}

impl ops::Add<Displacement> for Pos {
    type Output = Pos;

    fn add(self, rhs: Displacement) -> Pos {
        Pos {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl ops::Add<Direction> for Pos {
    type Output = Pos;

    fn add(self, rhs: Direction) -> Pos {
        self + rhs.to_displacement()
    }
}

impl ops::AddAssign<Displacement> for Pos {
    fn add_assign(&mut self, displacement: Displacement) {
        self.x += displacement.x;
        self.y += displacement.y;
    }
}

impl ops::AddAssign<Direction> for Pos {
    fn add_assign(&mut self, direction: Direction) {
        *self += direction.to_displacement();
    }
}

impl ops::Sub<Displacement> for Pos {
    type Output = Pos;

    fn sub(self, rhs: Displacement) -> Pos {
        Pos {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl ops::Sub<Direction> for Pos {
    type Output = Pos;

    fn sub(self, rhs: Direction) -> Pos {
        let displacement = rhs.to_displacement();
        Pos {
            x: self.x - displacement.x,
            y: self.y - displacement.y,
        }
    }
}

impl ops::Sub for Pos {
    type Output = Displacement;

    fn sub(self, rhs: Pos) -> Displacement {
        Displacement {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl Displacement {
    pub fn distance(self) -> u32 {
        (self.x.abs() + self.y.abs() + (self.x + self.y).abs()) as u32 / 2u32
    }

    pub fn direction(self) -> Option<Direction> {
        if self.distance() == 0 {
            return None;
        }
        match self / self.distance() {
            Displacement { x: 1, y: 0 } => Some(Direction::Southeast),
            Displacement { x: 1, y: -1 } => Some(Direction::East),
            Displacement { x: 0, y: -1 } => Some(Direction::Northeast),
            Displacement { x: -1, y: 0 } => Some(Direction::Northwest),
            Displacement { x: -1, y: 1 } => Some(Direction::West),
            Displacement { x: 0, y: 1 } => Some(Direction::Southwest),
            _ => None,
        }
    }
}

impl ops::Add for Displacement {
    type Output = Displacement;

    fn add(self, rhs: Displacement) -> Displacement {
        Displacement {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl ops::Add<Direction> for Displacement {
    type Output = Displacement;

    fn add(self, rhs: Direction) -> Displacement {
        let displacement = rhs.to_displacement();
        Displacement {
            x: self.x + displacement.x,
            y: self.y + displacement.y,
        }
    }
}

impl ops::Sub for Displacement {
    type Output = Displacement;

    fn sub(self, rhs: Displacement) -> Displacement {
        Displacement {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl ops::Mul<i32> for Displacement {
    type Output = Displacement;

    fn mul(self, rhs: i32) -> Displacement {
        Displacement {
            x: self.x * rhs,
            y: self.y * rhs,
        }
    }
}

impl ops::Mul<u32> for Displacement {
    type Output = Displacement;

    fn mul(self, rhs: u32) -> Displacement {
        Displacement {
            x: self.x * rhs as i32,
            y: self.y * rhs as i32,
        }
    }
}

impl ops::Div<u32> for Displacement {
    type Output = Displacement;

    fn div(self, rhs: u32) -> Displacement {
        if rhs == 0 {
            panic!("attempt to divide by zero");
        }
        let x = self.x as f32 / rhs as f32;
        let y = self.y as f32 / rhs as f32;
        let x_int = x.round();
        let y_int = y.round();
        let xy_int = (x + y).round();
        let dx = (x - x_int).abs();
        let dy = (y - y_int).abs();
        let dz = (x + y - xy_int).abs();
        if dx > dy && dx > dz {
            Displacement {
                x: (xy_int - y_int) as i32,
                y: y_int as i32,
            }
        } else if dy > dz {
            Displacement {
                x: x_int as i32,
                y: (xy_int - x_int) as i32,
            }
        } else {
            Displacement {
                x: x_int as i32,
                y: y_int as i32,
            }
        }
    }
}

impl ops::Neg for Displacement {
    type Output = Displacement;

    fn neg(self) -> Displacement {
        Displacement {
            x: -self.x,
            y: -self.y,
        }
    }
}

impl Direction {
    pub fn to_displacement(self) -> Displacement {
        match self {
            Direction::Southeast => Displacement { x: 1, y: 0 },
            Direction::East => Displacement { x: 1, y: -1 },
            Direction::Northeast => Displacement { x: 0, y: -1 },
            Direction::Northwest => Displacement { x: -1, y: 0 },
            Direction::West => Displacement { x: -1, y: 1 },
            Direction::Southwest => Displacement { x: 0, y: 1 },
        }
    }

    pub fn rotate(self, n: i32) -> Direction {
        let index = n + match self {
            Direction::Northeast => 0,
            Direction::East => 1,
            Direction::Southeast => 2,
            Direction::Southwest => 3,
            Direction::West => 4,
            Direction::Northwest => 5,
        };
        let corrected_index = ((index % 6) + 6) % 6;
        DIRECTIONS[corrected_index as usize]
    }

    pub fn x(self) -> i32 {
        self.to_displacement().x
    }

    pub fn y(self) -> i32 {
        self.to_displacement().y
    }
}

impl ops::Mul<i32> for Direction {
    type Output = Displacement;

    fn mul(self, rhs: i32) -> Displacement {
        self.to_displacement() * rhs
    }
}

impl ops::Mul<u32> for Direction {
    type Output = Displacement;

    fn mul(self, rhs: u32) -> Displacement {
        self.to_displacement() * rhs
    }
}

impl ops::Neg for Direction {
    type Output = Direction;

    fn neg(self) -> Direction {
        self.rotate(3)
    }
}

impl<T> Grid<T> {
    /// Create a new grid.
    ///
    /// The `init` closure takes a `usize` which is the index of the position,
    /// and a `Pos` which is the position itself.
    pub fn new<F>(width: usize, height: usize, mut init: F) -> Self
    where
        F: FnMut(Pos) -> T,
    {
        let mut grid = Vec::with_capacity(width * height);
        for row in 0..height {
            for col in 0..width {
                let pos = index_to_pos(Index2d { row, col });
                grid.push(init(pos))
            }
        }
        Grid {
            width,
            height,
            grid,
        }
    }

    /// Turn a position in a grid into a location.
    pub fn pos_to_location(&self, pos: Pos) -> Location {
        let Index2d { row, col } = pos_to_index(pos);
        Location {
            x: ((row % 2) + 2 * col) as i32,
            y: row as i32,
        }
    }

    /// Whether a position is within the bounds of this grid.
    pub fn contains(&self, pos: Pos) -> bool {
        let Index2d { row, col } = pos_to_index(pos);
        col < self.width && row < self.height
    }

    pub fn positions(&self) -> impl Iterator<Item = Pos> {
        positions(self.width, self.height)
    }

    pub fn inner_positions(&self) -> impl Iterator<Item = Pos> {
        inner_positions(self.width, self.height)
    }

    pub fn iter(&self) -> ::std::slice::Iter<T> {
        self.grid.iter()
    }

    pub fn iter_mut(&mut self) -> ::std::slice::IterMut<T> {
        self.grid.iter_mut()
    }

    /// Find the central position of this grid.
    pub fn center(&self) -> Pos {
        index_to_pos(Index2d {
            row: self.height / 2,
            col: self.width / 2,
        })
    }
}

fn positions(width: usize, height: usize) -> impl Iterator<Item = Pos> {
    (0..height).flat_map(move |row| (0..width).map(move |col| index_to_pos(Index2d { row, col })))
}

fn inner_positions(width: usize, height: usize) -> impl Iterator<Item = Pos> {
    let inner_width = width - 2;
    let inner_height = height - 2;
    (0..inner_height).flat_map(move |row| {
        (0..inner_width).map(move |col| {
            index_to_pos(Index2d {
                row: row + 1,
                col: col + 1,
            })
        })
    })
}

impl<T> ops::Index<Index2d> for Grid<T> {
    type Output = T;

    fn index(&self, Index2d { row, col }: Index2d) -> &T {
        let i = row * self.width + col;
        &self.grid[i]
    }
}

impl<T> ops::IndexMut<Index2d> for Grid<T> {
    fn index_mut(&mut self, Index2d { row, col }: Index2d) -> &mut T {
        let i = row * self.width + col;
        &mut self.grid[i]
    }
}

impl<T> ops::Index<Pos> for Grid<T> {
    type Output = T;

    fn index(&self, pos: Pos) -> &T {
        let Index2d { row, col } = pos_to_index(pos);
        let i = row * self.width + col;
        &self.grid[i]
    }
}

impl<T> ops::IndexMut<Pos> for Grid<T> {
    fn index_mut(&mut self, pos: Pos) -> &mut T {
        let Index2d { row, col } = pos_to_index(pos);
        let i = row * self.width + col;
        &mut self.grid[i]
    }
}

impl<T> IntoIterator for Grid<T> {
    type Item = T;
    type IntoIter = ::std::vec::IntoIter<T>;

    fn into_iter(self) -> Self::IntoIter {
        self.grid.into_iter()
    }
}

/// Turn a linear index into a position.
fn index_to_pos(i: Index2d) -> Pos {
    Pos {
        x: row_first_x(i.row) + i.col as i32,
        y: row_first_y(i.row) - i.col as i32,
    }
}

/// Turn a position into a 2d index.
fn pos_to_index(pos: Pos) -> Index2d {
    let Pos { x, y } = pos;
    let row = (x + y) as usize;
    let col = (x - row_first_x(row)) as usize;
    Index2d { row, col }
}

/// Find the first x-coordinate of a given row.
fn row_first_x(row: usize) -> i32 {
    (row as i32 + 1) / 2
}

/// Find the first y-coordinate of a given row.
fn row_first_y(row: usize) -> i32 {
    row as i32 / 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rotate() {
        assert_eq!(Direction::Northeast, Direction::Northeast.rotate(6));
        assert_eq!(Direction::Northwest, Direction::Northeast.rotate(-1));
        assert_eq!(Direction::West, Direction::Northwest.rotate(3).rotate(2));
        assert_eq!(-Direction::West, Direction::East);
    }

    #[test]
    fn test_pos_displacement() {
        let a = Displacement { x: 1, y: 2 };
        let b = Displacement { x: 3, y: -4 };
        let c = Displacement { x: 4, y: -2 };
        let x = Pos { x: 3, y: -4 };
        let y = Pos { x: 4, y: -2 };
        assert_eq!(a + b, c);
        assert_eq!(c - b, a);
        assert_eq!(a + a, a * 2);
        assert_eq!(y - x, a);
        assert_eq!(x + a, y);
        assert_eq!(b, Direction::Southeast * b.x + Direction::Southwest * b.y);
    }

    #[test]
    fn test_coordinate_conversion() {
        for row in 0..10 {
            for col in 0..10 {
                let i = Index2d { row, col };
                assert_eq!(i, pos_to_index(index_to_pos(i)));
            }
        }
    }

    #[test]
    fn test_index_order() {
        let g = Grid::new(10, 10, |pos| pos_to_index(pos));
        for pos in g.positions() {
            let index = pos_to_index(pos);
            assert_eq!(index, g[pos]);
        }
    }

    fn on_outer_edge<T>(pos: Pos, grid: &Grid<T>) -> bool {
        grid.contains(pos) && pos.neighbors().iter().any(|&pos| !grid.contains(pos))
    }

    #[test]
    fn test_inner_positions() {
        let grid = Grid::new(40, 40, |_pos| false);
        let mut positions = grid.inner_positions();
        assert!(positions.all(|pos| !on_outer_edge(pos, &grid)));
    }
}
