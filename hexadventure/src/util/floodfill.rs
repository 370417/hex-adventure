use std::collections::HashSet;
use std::iter::{IntoIterator, Iterator};
use util::grid::{Direction, Pos};

/// Perform a floodfill starting at origin.
///
/// Positions are flooded if they are connected to the origin and floodable(pos) returns true.
pub fn flood<F>(origin: Pos, floodable: F) -> HashSet<Pos>
where
    F: Fn(Pos) -> bool,
{
    let mut flooded = HashSet::new();
    if !floodable(origin) {
        return flooded;
    }
    flooded.insert(origin);
    let segment = Segment {
        start: flood_ray(origin, Direction::East, &mut flooded, &floodable),
        end: flood_ray(origin, Direction::West, &mut flooded, &floodable),
    };
    flood_vert(
        segment.clone(),
        FloodDirection::North,
        &mut flooded,
        &floodable,
    );
    flood_vert(segment, FloodDirection::South, &mut flooded, &floodable);
    flooded
}

/// A horizontal segment of positions from start to end inclusive.
///
/// For iteration, start is assumed to be to the east and end to the west (like the sun).
#[derive(Clone)]
struct Segment {
    start: Pos,
    end: Pos,
}

/// Describes whether the current flood_vert call is headed north or south.
#[derive(Copy, Clone)]
enum FloodDirection {
    North,
    South,
}

/// Flood to the north or south of an origin segment.
fn flood_vert<F>(
    origin: Segment,
    direction: FloodDirection,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) where
    F: Fn(Pos) -> bool,
{
    let segment = origin.expand(direction);
    let Segment { start, end } = segment;
    let mut subsegments = segment.flood(flooded, floodable);
    if let Some(ref mut first) = subsegments.first_mut() {
        if first.start == start {
            first.start = flood_ray(start, Direction::East, flooded, floodable);
            let overhang = Segment {
                start: first.start,
                end: start + Direction::East,
            };
            flood_vert(overhang, direction.opposite(), flooded, floodable);
        }
    }
    if let Some(ref mut last) = subsegments.last_mut() {
        if last.end == end {
            last.end = flood_ray(end, Direction::West, flooded, floodable);
            let overhang = Segment {
                start: end + Direction::West,
                end: last.end,
            };
            flood_vert(overhang, direction.opposite(), flooded, floodable);
        }
    }
    for subsegment in subsegments {
        flood_vert(subsegment, direction, flooded, floodable);
    }
}

/// Flood a ray of positions, beginning at origin (not inclusive)
/// and continuing in a certain direction until a non-floodable position is reached.
fn flood_ray<F>(origin: Pos, direction: Direction, flooded: &mut HashSet<Pos>, floodable: &F) -> Pos
where
    F: Fn(Pos) -> bool,
{
    let mut pos = origin + direction;
    while floodable(pos) && !flooded.contains(&pos) {
        flooded.insert(pos);
        pos += direction;
    }
    pos - direction
}

impl Segment {
    /// Expand a segment north or south.
    /// The resulting segment is longer than the original by 1.
    fn expand(&self, direction: FloodDirection) -> Self {
        let (start_dir, end_dir) = match direction {
            FloodDirection::North => (Direction::Northeast, Direction::Northwest),
            FloodDirection::South => (Direction::Southeast, Direction::Southwest),
        };
        Segment {
            start: self.start + start_dir,
            end: self.end + end_dir,
        }
    }

    /// Flood an entire segment.
    /// This skips over non-floodable positions instead of stopping at them.
    /// Returns a vector of floodable subsegments.
    fn flood<F>(self, flooded: &mut HashSet<Pos>, floodable: &F) -> Vec<Segment>
    where
        F: Fn(Pos) -> bool,
    {
        let mut start = None;
        let mut segments = Vec::new();
        let end = self.end;
        for pos in self {
            if floodable(pos) && !flooded.contains(&pos) {
                flooded.insert(pos);
                if start.is_none() {
                    start = Some(pos);
                }
            } else if let Some(start_pos) = start {
                segments.push(Segment {
                    start: start_pos,
                    end: pos - Direction::West,
                });
                start = None;
            }
        }
        if let Some(start_pos) = start {
            segments.push(Segment {
                start: start_pos,
                end,
            });
        }
        segments
    }
}

impl FloodDirection {
    fn opposite(&self) -> Self {
        match *self {
            FloodDirection::North => FloodDirection::South,
            FloodDirection::South => FloodDirection::North,
        }
    }
}

struct SegmentIterator {
    pos: Pos,
    stop: Pos,
}

impl IntoIterator for Segment {
    type Item = Pos;
    type IntoIter = SegmentIterator;

    fn into_iter(self) -> Self::IntoIter {
        SegmentIterator {
            pos: self.start,
            stop: self.end + Direction::West,
        }
    }
}

impl Iterator for SegmentIterator {
    type Item = Pos;

    fn next(&mut self) -> Option<Self::Item> {
        if self.pos == self.stop {
            None
        } else {
            let old_pos = self.pos;
            self.pos += Direction::West;
            Some(old_pos)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use rand::{thread_rng, Rng};
    use util::grid::Grid;

    fn basic_flood<F>(origin: Pos, floodable: F) -> HashSet<Pos>
    where
        F: Fn(Pos) -> bool,
    {
        let mut flooded = HashSet::new();
        basic_flood_helper(origin, &mut flooded, &floodable);
        flooded
    }

    fn basic_flood_helper<F>(pos: Pos, flooded: &mut HashSet<Pos>, floodable: &F)
    where
        F: Fn(Pos) -> bool,
    {
        if floodable(pos) && !flooded.contains(&pos) {
            flooded.insert(pos);
            for neighbor in pos.neighbors() {
                basic_flood_helper(neighbor, flooded, floodable);
            }
        }
    }

    fn set_equiv(a: &HashSet<Pos>, b: &HashSet<Pos>) -> bool {
        a.len() == b.len() && a.iter().all(|item| b.contains(item))
    }

    #[test]
    fn flood_equiv_basic_flood() {
        let mut rng = thread_rng();
        for _i in 0..100 {
            let grid: Grid<bool> = Grid::new(20, 20, |_pos| rng.gen_bool(0.75));
            let normal_set = flood(grid.center(), |pos| grid.contains(pos) && grid[pos]);
            let basic_set = basic_flood(grid.center(), |pos| grid.contains(pos) && grid[pos]);
            assert!(set_equiv(&normal_set, &basic_set));
        }
    }
}
