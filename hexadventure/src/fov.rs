//! Field of view calculation.
//!
//! A position is considered to be in field of view from an origin
//! if and only if the position is on a line with an endpoint at the
//! origin not blocked by any wall.

use grid::{Pos, DIRECTIONS};
use num::rational::Ratio;
use num::traits::identities::{One, Zero};

/// Calculates field of view.
///
/// All this does is call scan on each of the six sextants.
pub fn calc_fov<F, G>(center: Pos, transparent: F, mut reveal: G)
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

/// Scan a sextant using recursive shadowcasting.
///
/// y represents the distance from the center.
/// Within this function, x represents the distance from the y-axis, and
/// the x-axis is rotated 120 degrees from the y-axis when using hex coordinates.
/// However, nothing in this function is specific to hex coordinates.
/// start and end give the slopes (x/y, not y/x) that bound the current scan.
/// They range from 0 to 1. There is no check that start <= end, but it is always the case.
/// The transparent and reveal closures abstract away the grid system.
/// Passing in different closures will let you operate over different sextants.
fn scan<F, G>(y: u32, start: Ratio<u32>, end: Ratio<u32>, transparent: &F, reveal: &mut G)
where
    F: Fn(u32, u32) -> bool,
    G: FnMut(u32, u32),
{
    // Define the range of x-coordinates.
    // We break ties inward because ties represent diagonal moves, and
    // when the start and and end slopes are restricted by walls, they
    // pick the inner diagonal tiebreaker to avoid going through walls.
    let min_x = round_tie_high(start * y);
    let max_x = round_tie_low(end * y);
    // We process min_x outside of the loop in order to define start well.
    // This avoids checking for edge cases within the loop
    // had we initialized start to Some(start) unconditionally.
    reveal(min_x, y);
    // We rebind start to avoid accidentally using an old, invalid start slope.
    // Some(slope) corresponds to the case where we are scanning an open segment.
    // None corresponds to the case where we are scanning through a wall.
    let mut start = if transparent(min_x, y) {
        Some(start)
    } else {
        None
    };
    for x in min_x + 1..=max_x {
        reveal(x, y);
        if transparent(x, y) {
            if start.is_none() {
                start = Some(slope(x, y));
            }
        } else {
            if let Some(start_slope) = start {
                scan(y + 1, start_slope, slope(x, y), transparent, reveal);
                start = None;
            }
        }
    }
    if let Some(start) = start {
        scan(y + 1, start, end, transparent, reveal);
    }
}

/// Returns the slope of the ray flush with the left side of (x, y).
/// Here left means the side of (x, y) on the x-axis with the smaller x-value.
///
/// When (x, y) corresponds to a wall, the result represents the largest possible end slope.
/// When it corresponds to a floor, the result represents the smallest possible start slope.
fn slope(x: u32, y: u32) -> Ratio<u32> {
    Ratio::new_raw(2 * x - 1, 2 * y)
}

/// Rounds a ratio. Ties are rounded up.
fn round_tie_high(x: Ratio<u32>) -> u32 {
    x.round().to_integer()
}

/// Rounds a ratio. Ties are rounded down.
fn round_tie_low(x: Ratio<u32>) -> u32 {
    (x - Ratio::new_raw(1, 2)).ceil().to_integer()
}
