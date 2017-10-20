package com.albertford

interface Mob {
    var pos: Pos
    var facingRight: Boolean
    var lastMove: Pos
}

class Player : Mob {
    override var pos = Pos(0, 0)
    override var facingRight = false
    override var lastMove = Pos(0, 0)
    var hasKey = false
    var sneaky = true
}
