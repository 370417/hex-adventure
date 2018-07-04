//! Field of view calculation.

use std::cmp::{Ord, Ordering};
use grid::{Pos, DIRECTIONS};

const START: Slope = Slope { dx: 0, dy: 1 };
const END: Slope = Slope { dx: 1, dy: 1 };

struct Slope {
    dx: u32,
    dy: u32,
}

impl Slope {
    fn new(x: u32, y: u32) -> Slope {
        Slope {
            dx: 2 * x - 1,
            dy: 2 * y,
        }
    }

    fn min_x(&self, y: u32) -> u32 {
        let q = (self.dx * y) / self.dy;
        let r = (self.dx * y) % self.dy;
        match (2 * r).cmp(&self.dy) {
            Ordering::Greater => q + 1,
            Ordering::Less => q,
            Ordering::Equal => q + 1,
        }
    }

    fn max_x(&self, y: u32) -> u32 {
        let q = (self.dx * y) / self.dy;
        let r = (self.dx * y) % self.dy;
        match (2 * r).cmp(&self.dy) {
            Ordering::Greater => q + 1,
            Ordering::Less => q,
            Ordering::Equal => q,
        }
    }
}

fn scan<F, G>(y: u32, start: Slope, end: Slope, transparent: &F, reveal: &mut G)
where
    F: Fn(u32, u32) -> bool,
    G: FnMut(u32, u32)
{
    let min_x = start.min_x(y);
    let max_x = end.max_x(y);
    let mut start = Some(start);
    for x in min_x..=max_x {
        reveal(x, y);
        if transparent(x, y) {
            if start.is_none() {
                start = Some(Slope::new(x, y));
            }
        } else {
            if x > min_x {
                if let Some(start) = start {
                    scan(y + 1, start, Slope::new(x, y), transparent, reveal);
                }
            }
            start = None;
        }
    }
    if let Some(start) = start {
        scan(y + 1, start, end, transparent, reveal);
    }
}

/// Calculates field of view.
pub fn fov<F, G>(center: Pos, transparent: F, mut reveal: G)
where
    F: Fn(Pos) -> bool,
    G: FnMut(Pos),
{
    reveal(center);
    for &dir_y in &DIRECTIONS {
        let dir_x = dir_y.rotate(2);
        let f = |x, y| transparent(center + dir_x * x + dir_y * y);
        let mut g = |x, y| reveal(center + dir_x * x + dir_y * y);
        scan(1, START, END, &f, &mut g);
    }
}
