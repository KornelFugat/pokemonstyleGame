// Creating field
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// Creating collisions

const collisionsMap = []
for (let i = 0; i< collisions.length; i+=70) {
    collisionsMap.push(collisions.slice(i, i+70))
}

const boundaries = []
const offset = {
    x: -1200,
    y: -610
}
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
    })
})

// Creating Battle Zones

const battleZonesMap = []
for (let i = 0; i< battleZonesData.length; i+=70) {
    battleZonesMap.push(battleZonesData.slice(i, i+70))
}

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
    })
})

// Importing images

const image = new Image()
image.src = './images/Town.png'

const foregroundImage = new Image()
foregroundImage.src = './images/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './images/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './images/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './images/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './images/playerRight.png'



// Creating player

const player = new Sprite({
    position: {
        x: canvas.width/2 - 192/4/2,
        y: canvas.height/2 - 68/2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites:  {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage

    }
})

// Creating background

const background = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: image
})

// Creating foreground

const foreground = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: foregroundImage
})

// Assign keys

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// Adding boundaries while moving 

function rectangularCollision({rectangle1, rectangle2}) {
    return(rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
        )
}

// Adding objects to 'moving objects' array

const movables = [background, ...boundaries, foreground, ...battleZones]

//Creating battle

const battle = {
    initiated: false
}

// What happens on screen every frame

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(boundary => {
        boundary.draw()
    })
    player.draw()
    foreground.draw()
    
    let moving = true
    player.animate = false

    if (battle.initiated) return

    //Activating battle

    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
                Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
                Math.max(player.position.y, battleZone.position.y))
                
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone
            }) &&
            overlappingArea > player.width * player.height /2
            && Math.random() < 0.02
            ) {
                console.log('battle')
                // Deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()
                
                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                initBattle()
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4,
                            })
                        }})
                        
                    }
                })
                break
            }
        }
    }

    // Moving up
    if (keys.w.pressed) {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 3
                }},
            })) {
                    moving = false
                    break
            }
        }

        if (moving)
            movables.forEach(movable => {movable.position.y += 3})}
    
    // Moving left
    if (keys.a.pressed){
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if (rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary, position: {
                x: boundary.position.x + 3,
                y: boundary.position.y
            }},
        })) {
                moving = false
                break
        }
    }
    if (moving)
        movables.forEach(movable => {movable.position.x += 3}) }
    
    // Moving right
    if (keys.d.pressed){
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x-3,
                    y: boundary.position.y
                }},
            })) {
                    moving = false
                    break
            }
        }
        if (moving)
          movables.forEach(movable => {movable.position.x -= 3})} 

    // Moving down
    if (keys.s.pressed){
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 3
                }},
            })) {
                    moving = false
                    break
            }
        }
        if (moving)
          movables.forEach(movable => {movable.position.y -= 3})}

}
// animate()

// Moving WSAD - Key events

window.addEventListener('keydown',(e) => {
    switch (e.key){
        case 'w':
            keys.w.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
    }
})
window.addEventListener('keyup',(e) => {
    switch (e.key){
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})

let clicked = false
addEventListener('click', () => {
    if (!clicked) {
    audio.map.play()
    clicked = true
    }
})


