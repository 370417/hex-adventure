use std::ops;

const DIRECTIONS: [Direction; 6] = [
    Direction::Northeast,
    Direction::East,
    Direction::Southeast,
    Direction::Southwest,
    Direction::West,
    Direction::Northwest,
];

struct Grid<T> {
    width: u32,
    height: u32,
    grid: Vec<T>,
}

struct Pos {
    x: i32,
    y: i32,
}

struct Displacement {
    x: i32,
    y: i32,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone)]
enum Direction {
    Southeast, East, Northeast, Northwest, West, Southwest
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

impl ops::Sub<Displacement> for Pos {
    type Output = Pos;

    fn sub(self, rhs: Displacement) -> Pos {
        Pos {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
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

impl <T> Grid<T> {

}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rotate() {
        assert_eq!(Direction::Northeast, Direction::Northeast.rotate(6));
        assert_eq!(Direction::Northwest, Direction::Northeast.rotate(-1));
        assert_eq!(Direction::West, Direction::Northwest.rotate(3).rotate(2));
    }
}
