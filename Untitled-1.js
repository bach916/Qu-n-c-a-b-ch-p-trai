<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Game with Pause and Resume Button</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            flex-direction: column;
        }
        canvas {
            border: 1px solid black;
        }
        #score {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 20px;
            font-family: Arial, sans-serif;
        }
        #restartButton, #pauseButton {
            font-size: 20px;
            font-family: Arial, sans-serif;
            margin: 5px;
        }
        #timerBar {
            width: 5cm;
            height: 20px;
            background-color: green;
            display: none;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div id="score">Score: 0</div>
    <button id="restartButton" onclick="restartGame()">Chơi lại</button>
    <button id="pauseButton" onclick="togglePause()">Tạm dừng</button>
    <canvas id="gameCanvas" width="480" height="320"></canvas>
    <div id="timerBar"></div>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let x, y, dx, dy, paddleX, score, multiplier, shield, shieldTimer, powerUp;
        let isPaused = false;
        const ballRadius = 10;
        const paddleHeight = 10;
        const paddleWidth = 120; // Thanh đỡ dài hơn một chút
        const effectDuration = 30000; // Thời gian hiệu ứng 30 giây
        let shieldInterval, multiplierInterval;

        function init() {
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 1.5; // Giảm tốc độ bóng
            dy = -1.5; // Giảm tốc độ bóng
            paddleX = (canvas.width - paddleWidth) / 2;
            score = 0;
            multiplier = 1;
            shield = false;
            shieldTimer = 0;
            powerUp = null;
            document.getElementById('score').innerText = `Score: ${score}`;
            document.getElementById('restartButton').style.display = 'none';
            document.getElementById('timerBar').style.display = 'none';
            document.getElementById('pauseButton').innerText = 'Tạm dừng';
        }

        document.addEventListener("mousemove", mouseMoveHandler, false);

        function mouseMoveHandler(e) {
            const relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            if (shield) {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            ctx.fillStyle = multiplier === 2 ? (Math.floor(Date.now() / 100) % 2 === 0 ? 'red' : 'green') : '#0095DD';
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        function drawScore() {
            document.getElementById('score').innerText = `Score: ${score}`;
        }

        function drawPowerUp() {
            if (powerUp) {
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = powerUp.type === 'multiplier' ? 'yellow' : 'pink';
                ctx.fill();
                ctx.closePath();
            }
        }

        function draw() {
            if (isPaused) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBall();
            drawPaddle();
            drawScore();
            drawPowerUp();

            if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > canvas.height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                    score += 1 * multiplier;
                    if (score % 10 === 0) {
                        spawnPowerUp();
                    }
                } else {
                    if (shield) {
                        dy = -dy;
                        shield = false;
                        clearInterval(shieldInterval);
                        document.getElementById('timerBar').style.display = 'none';
                    } else {
                        alert("GAME OVER");
                        document.getElementById('restartButton').style.display = 'block';
                        return;
                    }
                }
            }

            if (powerUp) {
                powerUp.y += 1; // Vật phẩm rơi xuống từ từ
                if (powerUp.y > canvas.height) {
                    powerUp = null; // Vật phẩm biến mất nếu không được nhận
                } else if (powerUp.y + 10 > canvas.height - paddleHeight && powerUp.x > paddleX && powerUp.x < paddleX + paddleWidth) {
                    activatePowerUp(powerUp.type);
                    powerUp = null; // Xóa power-up sau khi nhận
                }
            }

            x += dx;
            y += dy;
            requestAnimationFrame(draw);
        }

        function spawnPowerUp() {
            const powerUpTypes = ['multiplier', 'shield'];
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            powerUp = {
                x: Math.random() * (canvas.width - 20) + 10,
                y: 0,
                type: type
            };
        }

        function activatePowerUp(type) {
            const timerBar = document.getElementById('timerBar');
            timerBar.style.display = 'block';
            timerBar.style.width = '5cm';
            let width = 100;
            const interval = setInterval(() => {
                if (isPaused) return;
                width -= 100 / (effectDuration / 1000);
                timerBar.style.width = width + '%';
                if (width <= 0) {
                    clearInterval(interval);
                    timerBar.style.display = 'none';
                }
            }, 1000);

            if (type === 'multiplier') {
                multiplier = 2;
                clearInterval(multiplierInterval);
                multiplierInterval = setTimeout(() => {
                    multiplier = 1;
                }, effectDuration); // Hiệu ứng nhân đôi điểm kéo dài 30 giây
            } else if (type === 'shield') {
                shield = true;
                clearInterval(shieldInterval);
                shieldInterval = setTimeout(() => {
                    shield = false;
                    timerBar.style.display = 'none';
                }, effectDuration); // Khiên bảo vệ kéo dài 30 giây
            }
        }

        function togglePause() {
            isPaused = !isPaused;
            document.getElementById('pauseButton').innerText = isPaused ? 'Tiếp tục' : 'Tạm dừng';
            if (!isPaused) {
                draw();
            }
        }

        function restartGame() {
            init();
            draw();
        }

        init();
        draw();
    </script>
</body>
</html>
