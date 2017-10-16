package com.albertford

import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.g2d.TextureAtlas

class Game : ApplicationAdapter() {
    private lateinit var batch: SpriteBatch

    private lateinit var atlas: TextureAtlas

    private lateinit var level: Level

    private lateinit var display: Display

    override fun create() {
        batch = SpriteBatch()
        atlas = TextureAtlas("atlas/oryx.atlas")

        level = Level()
        level.init(0, Axial(5, 5))
        display = Display(level, atlas)

        Gdx.graphics.isContinuousRendering = false
        Gdx.graphics.requestRendering()
    }

    override fun render() {
        Gdx.gl.glClearColor(0f, 0f, 0f, 1f)
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        batch.begin()
        display.render(batch)
        batch.end()
    }

    override fun dispose() {
        batch.dispose()
        atlas.dispose()
    }
}
