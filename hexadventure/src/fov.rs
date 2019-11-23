//! Field of view calculation.
//!
//! A position is considered to be in field of view from an origin
//! if and only if the position is on a line with an endpoint at the
//! origin not blocked by any wall.

use prelude::*;
use grid::DIRECTIONS;
use num::rational::Ratio;
use num::traits::identities::{One, Zero};

/// Calculates field of view.
pub fn calc_fov<F, G>(center: Pos, transparent: F, mut reveal: G)
where
    F: Fn(Pos) -> bool,
    G: FnMut(Pos),
{
    reveal(center);
    for &dy in &DIRECTIONS {
        scan_sextant(center, dy, &transparent, &mut reveal);
    }
}

pub fn wander<F>(center: Pos, direction: Direction, transparent: F) -> Option<Vec<Pos>>
where
    F: Fn(Pos) -> bool,
{
    use rand::{thread_rng, Rng};
    let mut rng = thread_rng();
    let mut paths = Vec::new();
    for &tangent in &[direction.rotate(2), direction.rotate(-2)] {
        let xy_to_pos = |(x, y)| center + tangent * x + direction * y;
        let xy_vec_to_pos_vec = |path: Vec<(u32, u32)>| path.into_iter().map(xy_to_pos).collect();
        let f = |x, y| transparent(xy_to_pos((x, y)));
        let mut g = |path: Vec<(u32, u32)>| paths.push(xy_vec_to_pos_vec(path));
        scan_2(1, Ratio::zero(), Ratio::one(), false, false, &f, &mut g);
    }
    if paths.is_empty() {
        None
    } else {
        let index = rng.gen_range(0, paths.len());
        Some(paths.swap_remove(index))
    }
}

fn scan_sextant<F, G>(center: Pos, dy: Direction, transparent: &F, reveal: &mut G)
where
    F: Fn(Pos) -> bool,
    G: FnMut(Pos),
{
    let dx = dy.rotate(2);
    let f = |x, y| transparent(center + dx * x + dy * y);
    let mut g = |x, y| reveal(center + dx * x + dy * y);
    scan_row(1, Ratio::zero(), Ratio::one(), &f, &mut g);
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
fn scan_row<F, G>(y: u32, start: Ratio<u32>, end: Ratio<u32>, transparent: &F, reveal: &mut G)
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
                scan_row(y + 1, start_slope, slope(x, y), transparent, reveal);
                start = None;
            }
        }
    }
    if let Some(start) = start {
        scan_row(y + 1, start, end, transparent, reveal);
    }
}

fn scan_2<F, G>(
    y: u32,
    start: Ratio<u32>,
    end: Ratio<u32>,
    mut check_start_corner: bool,
    check_end_corner: bool,
    transparent: &F,
    reveal: &mut G,
) where
    F: Fn(u32, u32) -> bool,
    G: FnMut(Vec<(u32, u32)>),
{
    let min_x = round_tie_high(start * y);
    let max_x = round_tie_low(end * y);
    let mut start = if transparent(min_x, y) {
        if check_start_corner {
            reveal((1..=y).map(|y| (round_tie_high(start * y), y)).collect());
            check_start_corner = false;
        }
        Some(start)
    } else {
        check_start_corner = true;
        None
    };
    for x in min_x + 1..=max_x {
        if transparent(x, y) {
            if start.is_none() {
                start = Some(slope(x, y));
            }
        } else {
            if let Some(start_slope) = start {
                scan_2(y + 1, start_slope, slope(x, y), check_start_corner, true, transparent, reveal);
                start = None;
                check_start_corner = true;
            }
        }
    }
    if let Some(start) = start {
        if check_end_corner {
            reveal((1..=y).map(|y| (round_tie_low(end * y), y)).collect());
        }
        scan_2(y + 1, start, end, check_start_corner, false, transparent, reveal);
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
