use grid::{Pos, Direction, DIRECTIONS};
use pathfinding::astar::astar;

pub(super) fn jps<FP, FH>(origin: Pos, goal: Pos, passable: FP, heuristic: FH) -> Option<(Vec<Pos>, u32)>
where
    FP: Fn(Pos) -> bool,
    FH: Fn(Pos) -> u32,
{
    let node_path = astar(&Node::Start(origin), |n| n.neighbors(passable), |n| n.heuristic(heuristic), |n| n.success(goal));
    match node_path {
        Some((path, cost)) => {
            let pos_path = Vec::with_capacity(cost as usize);
            for i in 1..pos_path.len() - 1 {
                let target = pos_path[i + 1];
            }
            panic!()
        }
        None => None,
    }
}

#[derive(PartialEq, Eq, Hash, Clone)]
enum Node {
    Start(Pos),
    JumpPoint {
        pos: Pos,
        direction: Direction,
        chirality: Chirality,
    }
}

#[derive(PartialEq, Eq, Hash, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

fn rotate(direction: Direction, n: i32, chirality: Chirality) -> Direction {
    match chirality {
        Chirality::Clockwise => direction.rotate(n),
        Chirality::Counterclockwise => direction.rotate(-n),
    }
}

impl Node {
    fn neighbors<FP>(&self, passable: FP) -> Vec<(Self, u32)>
    where
        FP: Fn(Pos) -> bool,
    {
        match *self {
            Node::Start(pos) => {
                DIRECTIONS.into_iter().map(|&direction| (Node::JumpPoint {
                    pos,
                    direction,
                    chirality: Chirality::Clockwise,
                }, 0)).collect()
            }
            Node::JumpPoint {
                pos,
                direction,
                chirality,
            } => {
                let mut neighbors = Vec::new();
                let leaf_direction = rotate(direction, 1, chirality);
                let leaf_block_in = rotate(leaf_direction, 2, chirality);
                let leaf_forced_in = rotate(leaf_direction, 1, chirality);
                let leaf_block_out = rotate(leaf_direction, -2, chirality);
                let leaf_forced_out = rotate(leaf_direction, -1, chirality);
                let stem_block = rotate(direction, -2, chirality);
                let stem_forced = rotate(direction, -1, chirality);
                for y in 1.. {
                    let stem_pos = pos + direction * y;
                    if !passable(stem_pos) {
                        break;
                    }
                    if !passable(stem_pos + stem_block) && passable(stem_pos + stem_forced) {
                        neighbors.push((Node::JumpPoint {
                            pos: stem_pos,
                            direction: rotate(direction, -1, chirality),
                            chirality,
                        }, y));
                    }
                    for x in 1.. {
                        let leaf_pos = stem_pos + leaf_direction * x;
                        if !passable(leaf_pos) {
                            break;
                        }
                        if !passable(leaf_pos + leaf_block_in) && passable(leaf_pos + leaf_forced_in) {
                            neighbors.push((Node::JumpPoint {
                                pos: leaf_pos,
                                direction: rotate(leaf_direction, 1, chirality),
                                chirality: chirality.opposite(),
                            }, x + y))
                        }
                        if !passable(leaf_pos + leaf_block_out) && passable(leaf_pos + leaf_forced_out) {
                            neighbors.push((Node::JumpPoint {
                                pos: leaf_pos,
                                direction,
                                chirality,
                            }, x + y))
                        }
                    }
                }
                neighbors
            }
        }
    }

    fn heuristic<FH>(&self, pos_heuristic: FH) -> u32
    where
        FH: Fn(Pos) -> u32,
    {
        match *self {
            Node::Start(pos) => pos_heuristic(pos),
            Node::JumpPoint { pos, .. } => pos_heuristic(pos),
        }
    }

    fn success(&self, goal: Pos) -> bool {
        match *self {
            Node::Start(pos) => pos == goal,
            Node::JumpPoint { pos, .. } => pos == goal,
        }
    }
}

impl Chirality {
    fn opposite(&self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}
