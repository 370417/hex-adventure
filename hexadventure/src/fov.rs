//! Field of view calculation.

use grid::{Direction, Pos};

const NORMALS: [Direction; 6] = [
    Direction::Northeast,
    Direction::East,
    Direction::Southeast,
    Direction::Southwest,
    Direction::West,
    Direction::Northwest,
];
const TANGENTS: [Direction; 6] = [
    Direction::Southeast,
    Direction::Southwest,
    Direction::West,
    Direction::Northwest,
    Direction::Northeast,
    Direction::East,
];

/// Calculates field of view.
pub fn fov<F, G>(center: Pos, transparent: F, mut reveal: G)
where
    F: Fn(Pos) -> bool,
    G: FnMut(Pos),
{
    reveal(center);
    for i in 0..6 {
        let transform = |x, y| center + TANGENTS[i] * x as i32 + NORMALS[i] * y as i32;
        scan(
            1,
            0.0,
            1.0,
            &|x, y| transparent(transform(x, y)),
            &mut |x, y| reveal(transform(x, y)),
        );
    }
}

/// Recursively scans one sector.
///
/// One sector corresponds to one sixth of a hexagon, like a pie slice.
fn scan<F, G>(y: u32, mut start: f32, end: f32, transparent: &F, reveal: &mut G)
where
    F: Fn(u32, u32) -> bool,
    G: FnMut(u32, u32),
{
    let mut was_transparent = None;
    let x_min = round_high(y as f32 * start);
    let x_max = round_low(y as f32 * end);
    for x in x_min..1 + x_max {
        if transparent(x, y) {
            if x as f32 >= y as f32 * start && x as f32 <= y as f32 * end {
                reveal(x, y);
                was_transparent = Some(true);
            }
        } else {
            {
                let end = (x as f32 - 0.5) / y as f32;
                if start < end {
                    if let Some(true) = was_transparent {
                        scan(y + 1, start, end, transparent, reveal);
                    }
                }
            }
            reveal(x, y);
            was_transparent = Some(false);
            start = (x as f32 + 0.5) / y as f32;
            if start >= end {
                return;
            }
        }
    }
    if start < end {
        match was_transparent {
            Some(true) => scan(y + 1, start, end, transparent, reveal),
            Some(false) => (),
            None => {
                let x = y as f32 / 2.0 * (start + end);
                let x = x.round() as u32;
                reveal(x, y);
                scan(y + 1, start, end, transparent, reveal);
            }
        }
    }
}

/// Rounds a float. Ties are rounded up.
fn round_high(n: f32) -> u32 {
    n.round() as u32
}

/// Rounds a float. Ties are rounded down.
fn round_low(n: f32) -> u32 {
    if n % 1.0 == 0.5 {
        n.round() as u32 - 1
    } else {
        n.round() as u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_round_high() {
        assert_eq!(round_high(15.0), 15);
        assert_eq!(round_high(15.49), 15);
        assert_eq!(round_high(15.5), 16);
        assert_eq!(round_high(15.51), 16);
    }

    #[test]
    fn test_round_low() {
        assert_eq!(round_low(15.0), 15);
        assert_eq!(round_low(15.49), 15);
        assert_eq!(round_low(15.5), 15);
        assert_eq!(round_low(15.51), 16);
    }
}
