//! Representation of a hexagonal grid.
//! 
//! Uses axial coordinates.
//! This grid can be thought of as any plane in 3d space that is normal to the vector {1, 1, 1}.
//! The x-axis (of the hex grid, not of the 3d space) points in `Direction::Southeast`,
//! which is the vector {1, 0, -1} in 3d space.
//! The y-axis points in `Direction::Southwest`, which is the vector {0, 1, -1}.

use std::ops;

pub const DIRECTIONS: [Direction; 6] = [
    Direction::Northeast,
    Direction::East,
    Direction::Southeast,
    Direction::Southwest,
    Direction::West,
    Direction::Northwest,
];

pub struct Grid<T> {
    width: u32,
    height: u32,
    grid: Vec<T>,
}

/// A position on a hexagonal grid.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Pos {
    x: i32,
    y: i32,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Displacement {
    x: i32,
    y: i32,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Direction {
    Southeast, East, Northeast, Northwest, West, Southwest
}

impl Pos {
    pub fn neighbors(self) -> Vec<Pos> {
        DIRECTIONS.into_iter().map(|&direction| self + direction).collect()
    }

    pub fn distance(self, other: Pos) -> u32 {
        (other - self).distance()
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
        let displacement = rhs.to_displacement();
        Pos {
            x: self.x + displacement.x,
            y: self.y + displacement.y,
        }
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
}

impl ops::Mul<i32> for Direction {
    type Output = Displacement;

    fn mul(self, rhs: i32) -> Displacement {
        self.to_displacement() * rhs
    }
}

impl ops::Neg for Direction {
    type Output = Direction;

    fn neg(self) -> Direction {
        self.rotate(3)
    }
}

impl <T> Grid<T> {
    /// Create a new grid.
    /// 
    /// The `init` closure takes an `u32` which is the index of the position,
    /// and a `Pos` which is the position itself.
    pub fn new<F>(width: u32, height: u32, init: F) -> Self
            where F: Fn(u32, Pos) -> T {
        let area = width * height;
        Grid {
            width,
            height,
            grid: (0..area).map(|i| {
                let pos = linear_to_pos_helper(width, i as usize);
                init(i, pos)
            }).collect(),
        }
    }

    /// Turn a position into a linear index.
    pub fn pos_to_linear(&self, pos: Pos) -> usize {
        let Pos { x, y } = pos;
        let row = x + y;
        let col = x - row_first_x(row);
        (row * self.width as i32 + col) as usize
    }

    /// Turn a linear index into a position.
    pub fn linear_to_pos(&self, i: usize) -> Pos {
        linear_to_pos_helper(self.width, i)
    }
}

impl <T> ops::Index<usize> for Grid<T> {
    type Output = T;

    fn index(&self, i: usize) -> &T {
        &self.grid[i]
    }
}

impl <T> ops::IndexMut<usize> for Grid<T> {
    fn index_mut(&mut self, i: usize) -> &mut T {
        &mut self.grid[i]
    }
}

impl <T> ops::Index<Pos> for Grid<T> {
    type Output = T;

    fn index(&self, pos: Pos) -> &T {
        &self.grid[self.pos_to_linear(pos)]
    }
}

impl <T> ops::IndexMut<Pos> for Grid<T> {
    fn index_mut(&mut self, pos: Pos) -> &mut T {
        let i = self.pos_to_linear(pos);
        &mut self.grid[i]
    }
}

/// Turn a linear index into a position.
/// This is a helper function instead of being a method of Grid because
/// it needs to be called before an instance of Grid is created.
fn linear_to_pos_helper(width: u32, i: usize) -> Pos {
    let row = i as i32 / width as i32;
    let col = i as i32 % width as i32;
    Pos {
        x: row_first_x(row) + col,
        y: row_first_y(row) - col,
    }
}

/// Find the first x-coordinate of a given row.
fn row_first_x(row: i32) -> i32 {
    (row + 1) / 2
}

/// Find the first y-coordinate of a given row.
fn row_first_y(row: i32) -> i32 {
    row / 2
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
    fn coordinate_conversion() {
        let g = Grid::new(10, 10, |i, pos| i);
        for i in 0..100 {
            assert_eq!(i, g.pos_to_linear(g.linear_to_pos(i)));
        }
    }
}
