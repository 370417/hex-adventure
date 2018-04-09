use std::collections::HashSet;
use std::iter::{IntoIterator, Iterator};
use util::grid::{Direction, Pos};

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
        start: flood_horiz(origin, Direction::East, &mut flooded, &floodable),
        end: flood_horiz(origin, Direction::West, &mut flooded, &floodable),
    };
    flood_vert(segment, FloodDirection::North, &mut flooded, &floodable);
    flood_vert(segment, FloodDirection::South, &mut flooded, &floodable);
    flooded
}

/// Flood to the east or west of origin, excluding origin.
///
/// Returns the outermost flooded position.
fn flood_horiz<F>(
    origin: Pos,
    direction: Direction,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) -> Pos
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

fn flood_vert<F>(
    origin: Segment,
    direction: FloodDirection,
    flooded: &mut HashSet<Pos>,
    floodable: &F,
) where
    F: Fn(Pos) -> bool,
{
    let segment = origin.expand(direction);
    let subsegments = flood_segment(segment, flooded, floodable);
    if let Some(first) = subsegments.first() {
        if first.start == segment.start {
            let east_edge = flood_horiz(segment.start, Direction::East, flooded, floodable);
            let overhang = Segment {
                start: east_edge,
                end: segment.start + Direction::East,
            };
            flood_vert(overhang, direction.opposite(), flooded, floodable);
        }
    }
    if let Some(last) = subsegments.last() {
        if last.end == segment.end {
            let west_edge = flood_horiz(segment.end, Direction::West, flooded, floodable);
            let overhang = Segment {
                start: segment.end + Direction::West,
                end: west_edge,
            };
            flood_vert(overhang, direction.opposite(), flooded, floodable);
        }
    }
    for subsegment in subsegments {
        flood_vert(subsegment, direction, flooded, floodable);
    }
}

#[derive(Copy, Clone)]
enum FloodDirection {
    North,
    South,
}

impl FloodDirection {
    fn opposite(&self) -> Self {
        match *self {
            FloodDirection::North => FloodDirection::South,
            FloodDirection::South => FloodDirection::North,
        }
    }
}

/// A horizontal segment of positions from start to end inclusive.
#[derive(Copy, Clone)]
struct Segment {
    start: Pos,
    end: Pos,
}

struct SegmentIterator {
    pos: Pos,
    stop: Pos,
}

impl Segment {
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

/// Flood from a segment of positions. Returns a vector of subsegments
fn flood_segment<F>(segment: Segment, flooded: &mut HashSet<Pos>, floodable: &F) -> Vec<Segment>
where
    F: Fn(Pos) -> bool,
{
    let mut start = None;
    let mut segments = Vec::new();
    for pos in segment {
        if floodable(pos) && !flooded.contains(&pos) {
            flooded.insert(pos);
            if start.is_none() {
                start = Some(pos);
            }
        } else if let Some(start_pos) = start {
            segments.push(Segment {
                start: start_pos,
                end: pos,
            });
            start = None;
        }
    }
    if let Some(start_pos) = start {
        segments.push(Segment {
            start: start_pos,
            end: segment.end,
        });
    }
    segments
}
