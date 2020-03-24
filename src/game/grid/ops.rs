use super::{pos_to_index, Direction, Displacement, Grid, Index2d, Pos, WIDTH};
use std::ops;

impl<T: ops::Add<T>> ops::Add<Displacement<T>> for Pos<T> {
    type Output = Pos<T::Output>;

    fn add(self, rhs: Displacement<T>) -> Pos<T::Output> {
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
    type Output = Displacement<f32>;

    fn div(self, rhs: u32) -> Displacement<f32> {
        if rhs == 0 {
            panic!("attempt to divide by zero");
        }
        Displacement {
            x: self.x as f32 / rhs as f32,
            y: self.y as f32 / rhs as f32,
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

impl<T> ops::Index<Index2d> for Grid<T> {
    type Output = T;

    fn index(&self, Index2d { row, col }: Index2d) -> &T {
        let i = row * WIDTH + col;
        &self.0[i]
    }
}

impl<T> ops::IndexMut<Index2d> for Grid<T> {
    fn index_mut(&mut self, Index2d { row, col }: Index2d) -> &mut T {
        let i = row * WIDTH + col;
        &mut self.0[i]
    }
}

impl<T> ops::Index<Pos> for Grid<T> {
    type Output = T;

    fn index(&self, pos: Pos) -> &T {
        let Index2d { row, col } = pos_to_index(pos);
        let i = row * WIDTH + col;
        &self.0[i]
    }
}

impl<T> ops::IndexMut<Pos> for Grid<T> {
    fn index_mut(&mut self, pos: Pos) -> &mut T {
        let Index2d { row, col } = pos_to_index(pos);
        let i = row * WIDTH + col;
        &mut self.0[i]
    }
}
