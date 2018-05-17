use grid::{Pos, Direction, DIRECTIONS};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, VecDeque};

pub(super) fn jps<FG, FP, FH>(origin: Pos, is_goal: FG, passable: FP, heuristic: FH) -> Option<Vec<Pos>>
where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
    FH: Fn(Pos) -> u32,
{
    if is_goal(origin) {
        return Some(vec![origin]);
    }
    let mut open = BinaryHeap::with_capacity(6);
    let origin_heuristic = heuristic(origin);
    for &direction in DIRECTIONS.iter() {
        open.push(MinHeapItem {
            node: JumpPoint {
                pos: origin,
                direction,
                chirality: Chirality::Clockwise,
            },
            priority: origin_heuristic,
        });
    }
    let mut parents: HashMap<Pos, Parent> = HashMap::with_capacity(6);
    parents.insert(origin, Parent {
        node: None,
        total_cost: 0,
        stem_cost: 0,
        leaf_cost: 0,
    });
    while let Some(MinHeapItem { node, .. }) = open.pop() {
        match node.neighbors(&is_goal, &passable) {
            Neighbors::Goal {
                pos,
                stem_cost,
                leaf_cost,
            } => {
                let total_cost = parents.get(&node.pos).unwrap().total_cost + stem_cost + leaf_cost;
                parents.insert(pos, Parent {
                    node: Some(node),
                    total_cost,
                    stem_cost,
                    leaf_cost,
                });
                return Some(construct_path(parents, pos));
            }
            Neighbors::Neighbors(neighbors) => {
                for neighbor in neighbors {
                    let new_cost = parents.get(&node.pos).unwrap().total_cost + neighbor.stem_cost + neighbor.leaf_cost;
                    if let Some(parent) = parents.get(&neighbor.node.pos) {
                        // normally we would skip a neighbor if its cost was equal to the cost found already
                        // here we don't because in this implementation of jps,
                        // multiple neighbors can be created for a single position
                        if new_cost > parent.total_cost {
                            continue;
                        }
                    }
                    open.push(MinHeapItem {
                        node: neighbor.node,
                        priority: new_cost + heuristic(neighbor.node.pos),
                    });
                    parents.insert(neighbor.node.pos, Parent {
                        node: Some(node),
                        total_cost: new_cost,
                        stem_cost: neighbor.stem_cost,
                        leaf_cost: neighbor.leaf_cost,
                    });
                }
            }
        }
    }
    None
}

fn construct_path(parents: HashMap<Pos, Parent>, goal: Pos) -> Vec<Pos> {
    let mut path = VecDeque::with_capacity(1 + parents.get(&goal).unwrap().total_cost as usize);
    path.push_back(goal);
    let mut pos = goal;
    while let Some(&Parent {
        node: Some(jump_point),
        stem_cost,
        leaf_cost,
        ..
    }) = parents.get(&pos) {
        let leaf_direction = rotate(jump_point.direction, 1, jump_point.chirality);
        for y in 0..stem_cost {
            path.push_back(jump_point.pos + jump_point.direction * y);
        }
        let stem_tip = jump_point.pos + jump_point.direction * stem_cost;
        for x in 0..leaf_cost {
            path.push_back(stem_tip + leaf_direction * x);
        }
        pos = jump_point.pos;
    }
    Vec::from(path)
}

#[derive(PartialEq, Eq)]
struct Parent {
    node: Option<JumpPoint>,
    total_cost: u32,
    stem_cost: u32,
    leaf_cost: u32,
}

#[derive(PartialEq, Eq)]
struct MinHeapItem {
    node: JumpPoint,
    priority: u32,
}

fn reverse(ordering: Ordering) -> Ordering {
    match ordering {
        Ordering::Equal => Ordering::Equal,
        Ordering::Greater => Ordering::Less,
        Ordering::Less => Ordering::Greater,
    }
}

impl PartialOrd for MinHeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(reverse(self.priority.cmp(&other.priority)))
    }
}

impl Ord for MinHeapItem {
    fn cmp(&self, other: &Self) -> Ordering {
        reverse(self.priority.cmp(&other.priority))
    }
}

#[derive(PartialEq, Eq, Hash, Copy, Clone)]
struct JumpPoint {
    pos: Pos,
    direction: Direction,
    chirality: Chirality,
}

enum Neighbors {
    Goal {
        pos: Pos,
        stem_cost: u32,
        leaf_cost: u32,
    },
    Neighbors(Vec<Neighbor>)
}

impl Neighbors {
    fn new_goal(pos: Pos, stem_cost: u32, leaf_cost: u32) -> Self {
        Neighbors::Goal {
            pos,
            stem_cost,
            leaf_cost,
        }
    }
}

struct Neighbor {
    node: JumpPoint,
    stem_cost: u32,
    leaf_cost: u32,
}

impl Neighbor {
    fn new(node: JumpPoint, stem_cost: u32, leaf_cost: u32) -> Self {
        Neighbor {
            node,
            stem_cost,
            leaf_cost,
        }
    }
}

impl JumpPoint {
    fn neighbors<FG, FP>(&self, is_goal: &FG, passable: &FP) -> Neighbors
    where
        FG: Fn(Pos) -> bool,
        FP: Fn(Pos) -> bool,
    {
        let mut neighbors = Vec::new();
        let leaf_direction = rotate(self.direction, 1, self.chirality);
        for y in 1.. {
            let stem_pos = self.pos + self.direction * y;
            if !passable(stem_pos) {
                break;
            }
            if is_goal(stem_pos) {
                return Neighbors::new_goal(stem_pos, y, 0);
            }
            if let Some(jump_point) = recur(stem_pos, self.direction, self.chirality, passable) {
                neighbors.push(Neighbor::new(jump_point, y, 0))
            }
            for x in 1.. {
                let leaf_pos = stem_pos + leaf_direction * x;
                if !passable(leaf_pos) {
                    break;
                }
                if is_goal(leaf_pos) {
                    return Neighbors::new_goal(leaf_pos, y, x);
                }
                if let Some(jump_point) = recur(leaf_pos, leaf_direction, self.chirality, passable) {
                    neighbors.push(Neighbor::new(jump_point, y, x));
                }
                if let Some(jump_point) = recur(leaf_pos, leaf_direction, self.chirality.opposite(), passable) {
                    neighbors.push(Neighbor::new(jump_point, y, x));
                }
            }
        }
        Neighbors::Neighbors(neighbors)
    }
}

fn recur<FP>(pos: Pos, direction: Direction, chirality: Chirality, passable: &FP) -> Option<JumpPoint>
where
    FP: Fn(Pos) -> bool,
{
    let corner = pos + rotate(direction, -2, chirality);
    let turn = rotate(direction, -1, chirality);
    if !passable(corner) && passable(pos + turn) {
        Some(JumpPoint {
            pos,
            direction: turn,
            chirality,
        })
    } else {
        None
    }
}

#[derive(PartialEq, Eq, Hash, Copy, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

impl Chirality {
    fn opposite(&self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}

fn rotate(direction: Direction, n: i32, chirality: Chirality) -> Direction {
    match chirality {
        Chirality::Clockwise => direction.rotate(n),
        Chirality::Counterclockwise => direction.rotate(-n),
    }
}
