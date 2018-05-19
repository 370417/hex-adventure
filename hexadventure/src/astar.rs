use grid::{decompose, Direction, Pos, DIRECTIONS};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, VecDeque};

pub(super) fn jps<FG, FP, FH>(
    origin: Pos,
    is_goal: FG,
    passable: FP,
    heuristic: FH,
) -> Option<Vec<Pos>>
where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
    FH: Fn(Pos) -> u32,
{
    if is_goal(origin) {
        return Some(vec![origin]);
    }
    let mut open = BinaryHeap::new();
    let mut parents = HashMap::new();
    // make sure the origin never receives a parent
    // (that would cause a loop when reconstructing the path)
    parents.insert(
        origin,
        Parent {
            pos: origin,
            stem_direction: Direction::East,
            leaf_direction: Direction::East,
            cost: 0,
        },
    );
    for &direction in DIRECTIONS.iter() {
        let nodes = find_initial_nodes(origin, direction, &is_goal, &passable);
        for node in nodes {
            let pos = node.pos();
            let cost = pos.distance(origin);
            open.push(MinHeapItem {
                node,
                priority: cost + heuristic(pos),
            });
            parents.insert(
                pos,
                Parent {
                    pos: origin,
                    stem_direction: direction,
                    leaf_direction: direction.rotate(1),
                    cost,
                },
            );
        }
    }
    while let Some(MinHeapItem { node, .. }) = open.pop() {
        match node {
            Node::Goal(pos) => {
                let total_cost = parents.get(&pos).unwrap().cost;
                return Some(construct_path(parents, pos, total_cost));
            }
            Node::JumpPoint { pos, direction } => {
                for (neighbor, leaf_direction) in neighbors(pos, direction, &is_goal, &passable) {
                    let neighbor_pos = neighbor.pos();
                    let new_cost = parents.get(&pos).unwrap().cost + neighbor.pos().distance(pos);
                    if let Some(parent) = parents.get(&neighbor_pos) {
                        // normally we would skip a neighbor if its cost was equal to the cost found already
                        // here we don't because in this implementation of jps,
                        // multiple neighbors can be created for a single position
                        if new_cost > parent.cost {
                            continue;
                        }
                    }
                    open.push(MinHeapItem {
                        node: neighbor,
                        priority: new_cost + heuristic(neighbor_pos),
                    });
                    parents.insert(
                        neighbor_pos,
                        Parent {
                            pos,
                            stem_direction: direction,
                            leaf_direction,
                            cost: new_cost,
                        },
                    );
                }
            }
        }
    }
    None
}

fn construct_path(parents: HashMap<Pos, Parent>, goal: Pos, total_cost: u32) -> Vec<Pos> {
    let mut path = VecDeque::with_capacity(1 + total_cost as usize);
    path.push_back(goal);
    let mut pos = goal;
    while let Some(parent) = parents.get(&pos) {
        if parent.cost == 0 {
            break;
        }
        let (stem_cost, leaf_cost) = decompose(
            pos - parent.pos,
            parent.stem_direction,
            parent.leaf_direction,
        );
        let stem_tip = parent.pos + parent.stem_direction * stem_cost;
        for x in (0..leaf_cost).rev() {
            path.push_back(stem_tip + parent.leaf_direction * x);
        }
        for y in (0..stem_cost).rev() {
            path.push_back(parent.pos + parent.stem_direction * y);
        }
        pos = parent.pos;
    }
    Vec::from(path)
}

#[derive(PartialEq, Eq)]
struct MinHeapItem {
    node: Node,
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

#[derive(PartialEq, Eq)]
enum Node {
    Goal(Pos),
    JumpPoint { pos: Pos, direction: Direction },
}

impl Node {
    fn pos(&self) -> Pos {
        match *self {
            Node::Goal(pos) => pos,
            Node::JumpPoint { pos, .. } => pos,
        }
    }
}

struct Parent {
    pos: Pos,
    stem_direction: Direction,
    leaf_direction: Direction,
    cost: u32,
}

#[derive(PartialEq, Eq, Hash, Clone)]
struct JumpPoint {
    pos: Pos,
    direction: Direction,
}

fn neighbors<FG, FP>(
    pos: Pos,
    direction: Direction,
    is_goal: &FG,
    passable: &FP,
) -> Vec<(Node, Direction)>
where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
{
    let mut neighbors = Vec::new();
    for y in 1.. {
        let pos = pos + direction * y;
        if !passable(pos) {
            break;
        }
        if is_goal(pos) {
            neighbors.push((Node::Goal(pos), direction.rotate(1)));
        } else {
            find_jump_points(pos, direction.rotate(1), &mut neighbors, is_goal, passable);
            find_jump_points(pos, direction.rotate(-1), &mut neighbors, is_goal, passable);
        }
    }
    neighbors
}

fn find_jump_points<FG, FP>(
    pos: Pos,
    direction: Direction,
    neighbors: &mut Vec<(Node, Direction)>,
    is_goal: &FG,
    passable: &FP,
) where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
{
    for x in 1.. {
        let pos = pos + direction * x;
        if !passable(pos) {
            break;
        }
        if is_goal(pos) {
            neighbors.push((Node::Goal(pos), direction));
        } else {
            if let Some(node) = add_initial_node(pos, direction, true, passable) {
                neighbors.push((node, direction));
            };
            if let Some(node) = add_initial_node(pos, direction, false, passable) {
                neighbors.push((node, direction));
            };
        }
    }
}

fn find_initial_nodes<FG, FP>(
    origin: Pos,
    direction: Direction,
    is_goal: &FG,
    passable: &FP,
) -> Vec<Node>
where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
{
    let mut nodes = Vec::new();
    let leaf_direction = direction.rotate(1);
    for y in 1.. {
        let pos = origin + direction * y;
        if !passable(pos) {
            break;
        }
        if is_goal(pos) {
            nodes.push(Node::Goal(pos));
        } else {
            if let Some(node) = add_initial_node(pos, direction, false, passable) {
                nodes.push(node);
            };
        }
        for x in 1.. {
            let pos = pos + leaf_direction * x;
            if !passable(pos) {
                break;
            }
            if is_goal(pos) {
                nodes.push(Node::Goal(pos));
            } else {
                if let Some(node) = add_initial_node(pos, leaf_direction, true, passable) {
                    nodes.push(node);
                };
                if let Some(node) = add_initial_node(pos, leaf_direction, false, passable) {
                    nodes.push(node);
                };
            }
        }
    }
    nodes
}

fn add_initial_node<FP>(
    pos: Pos,
    direction: Direction,
    reverse: bool,
    passable: &FP,
) -> Option<Node>
where
    FP: Fn(Pos) -> bool,
{
    let sign = if reverse { -1 } else { 1 };
    let corner = pos + direction.rotate(sign * -2);
    let turn = direction.rotate(sign * -1);
    if !passable(corner) && passable(pos + turn) {
        Some(Node::JumpPoint {
            pos,
            direction: turn,
        })
    } else {
        None
    }
}
