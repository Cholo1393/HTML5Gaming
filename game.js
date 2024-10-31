const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player1, player2, ball, cursors;
let score1 = 0, score2 = 0;
let scoreText1, scoreText2;
let gameMode = '1-player';
let aiSpeed = 100;
let game;
let winningScore = 3;
let player1Color = '#00ff00';
let player2Color = '#ff0000';

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('one-player').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('difficulty-menu').style.display = 'block';
    });

    document.getElementById('two-players').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('color-menu').style.display = 'block';
        gameMode = '2-players';
    });

    document.getElementById('easy').addEventListener('click', () => {
        aiSpeed = 200;
        showColorMenu();
    });

    document.getElementById('medium').addEventListener('click', () => {
        aiSpeed = 400;
        showColorMenu();
    });

    document.getElementById('hard').addEventListener('click', () => {
        aiSpeed = 500;
        showColorMenu();
    });

    document.getElementById('start-game').addEventListener('click', () => {
        player1Color = document.getElementById('player1-color').value;
        player2Color = document.getElementById('player2-color').value;
        startGame();
    });

    document.getElementById('restart-game').addEventListener('click', () => {
        restartGame();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
        goToMenu();
    });
});

function showColorMenu() {
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('color-menu').style.display = 'block';
}

function startGame() {
    document.getElementById('color-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    game = new Phaser.Game(config);  
}

function preload() {
    this.load.image('ball', 'Pinochet.jpg'); 
}

function create() {
    player1 = this.add.rectangle(50, this.cameras.main.height / 2, 20, 100, Phaser.Display.Color.HexStringToColor(player1Color).color);
    this.physics.add.existing(player1);
    player1.body.setImmovable(true);

    player2 = this.add.rectangle(this.cameras.main.width - 50, this.cameras.main.height / 2, 20, 100, Phaser.Display.Color.HexStringToColor(player2Color).color);
    this.physics.add.existing(player2);
    player2.body.setImmovable(true);

    ball = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'ball');
    ball.setCollideWorldBounds(true);
    ball.body.onWorldBounds = true;
    ball.setBounce(1, 1);
    ball.setDisplaySize(40, 40);

    this.physics.world.on('worldbounds', function (body, up, down, left, right) {
        if (left) {
            score2 += 1;
            scoreText2.setText('Score: ' + score2);
            checkWinCondition();
        } else if (right) {
            score1 += 1;
            scoreText1.setText('Score: ' + score1);
            checkWinCondition();
        }
    });

    this.physics.add.collider(ball, player1, hitPaddle, null, this);
    this.physics.add.collider(ball, player2, hitPaddle, null, this);

    scoreText1 = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: player1Color });
    scoreText2 = this.add.text(600, 16, 'Score: 0', { fontSize: '32px', fill: player2Color });
    cursors = this.input.keyboard.createCursorKeys();

    resetBall();
}

function update() {
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z).isDown) {
        player1.body.setVelocityY(-300);
    } else if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
        player1.body.setVelocityY(300);
    } else {
        player1.body.setVelocityY(0);
    }

    player1.y = Phaser.Math.Clamp(player1.y, player1.height / 2, config.height - player1.height / 2);

    if (gameMode === '1-player') {
        moveAI();
    } else {
        if (cursors.up.isDown) {
            player2.body.setVelocityY(-300);
        } else if (cursors.down.isDown) {
            player2.body.setVelocityY(300);
        } else {
            player2.body.setVelocityY(0);
        }
    }

    player2.y = Phaser.Math.Clamp(player2.y, player2.height / 2, config.height - player2.height / 2);
}

function resetBall() {
    ball.setPosition(config.width / 2, config.height / 2);
    ball.setVelocity(200 * (Math.random() < 0.5 ? 1 : -1), 200 * (Math.random() < 0.5 ? 1 : -1));
}

function hitPaddle(ball, paddle) {
    let diff = 0;

    if (ball.y < paddle.y) {
        diff = paddle.y - ball.y;
        ball.setVelocityY(-10 * diff);
    } else if (ball.y > paddle.y) {
        diff = ball.y - paddle.y;
        ball.setVelocityY(10 * diff);
    } else {
        ball.setVelocityY(2 + Math.random() * 10);
    }
}

function moveAI() {
    if (ball.y < player2.y - 10) {
        player2.body.setVelocityY(-aiSpeed);
    } else if (ball.y > player2.y + 10) {
        player2.body.setVelocityY(aiSpeed);
    } else {
        player2.body.setVelocityY(0);
    }

    player2.y = Phaser.Math.Clamp(player2.y, player2.height / 2, config.height - player2.height / 2);
}

function checkWinCondition() {
    if (score1 >= winningScore || score2 >= winningScore) {
        game.destroy(true);
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('victory-message').style.display = 'block';

        let victoryText = document.getElementById('victory-text');
        if (score1 >= winningScore) {
            victoryText.textContent = 'T Cho!';
        } else {
            victoryText.textContent = 'T Bon!';
        }
    } else {
        resetBall();
    }
}

function restartGame() {
    document.getElementById('victory-message').style.display = 'none';
    score1 = 0;
    score2 = 0;

    if (game) {
        game.destroy(true); 
    }

    startGame(); 
}

function goToMenu() {
    if (game) {
        game.destroy(true); 
    }

    document.getElementById('victory-message').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}
