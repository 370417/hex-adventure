//! Field of view calculation.

use grid::{Pos, DIRECTIONS};
use num::rational::Ratio;
use num::traits::identities::{One, Zero};

fn slope(x: u32, y: u32) -> Ratio<u32> {
    Ratio::new_raw(2 * x - 1, 2 * y)
}

fn round_tie_high(x: Ratio<u32>) -> u32 {
    x.round().to_integer()
}

fn round_tie_low(x: Ratio<u32>) -> u32 {
    (x - Ratio::new_raw(1, 2)).ceil().to_integer()
}

fn scan<F, G>(y: u32, start: Ratio<u32>, end: Ratio<u32>, transparent: &F, reveal: &mut G)
where
    F: Fn(u32, u32) -> bool,
    G: FnMut(u32, u32),
{
    let min_x = round_tie_high(start * y);
    let max_x = round_tie_low(end * y);
    let mut start = Some(start);
    for x in min_x..=max_x {
        reveal(x, y);
        if transparent(x, y) {
            if start.is_none() {
                start = Some(slope(x, y));
            }
        } else {
            if x > min_x {
                if let Some(start) = start {
                    scan(y + 1, start, slope(x, y), transparent, reveal);
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
    for &dy in &DIRECTIONS {
        let dx = dy.rotate(2);
        let f = |x, y| transparent(center + dx * x + dy * y);
        let mut g = |x, y| reveal(center + dx * x + dy * y);
        scan(1, Ratio::zero(), Ratio::one(), &f, &mut g);
    }
}
