package com.albertford

interface Mob {
    var pos: Pos
    var facingRight: Boolean
}

class Player : Mob {
    override var pos = Pos(0, 0)
    override var facingRight = false
    var hasKey = false
}
