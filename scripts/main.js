
class Particle {
    /**
     * @param {number} x
     * @param {number} y
     * @param {string} color
     */
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        // 随机生成粒子炸开的方向
        this.vx = (0.5 - Math.random()) * 100;  // 左右
        this.vy = (0.5 - Math.random()) * 100;  // 上下
        // 随机生成粒子有效期，来判断每个粒子何时熄灭
        this.age = Math.random() * 100 | 0;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.vx / 20;
        this.y += this.vy / 20;
        // 同时改变粒子的垂直方向的值，确保粒子会向下运动
        this.vy++;
        this.age--;
    }
}

class Fireworks {

    /**
     * @param {number} width
     * @param {number} height
     * @param {CanvasRenderingContext2D} ctx
     * @param cb
     */
    constructor(width, height, ctx, cb) {
        this.ctx = ctx;
        this.particles = [];
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.cb = cb;
        this.isBoom = false;
        this.init();
    }

    init() {
        this.x = (Math.random() * (this.canvasWidth - 40) + 40) | 0;
        this.y = this.canvasHeight;
        this.color = `hsl(${Math.random() * 360 | 0}, 100%, 60%)`;
        this.gravity = -(Math.random() * Math.sqrt(this.canvasHeight) / 3 + Math.sqrt(4 * this.canvasHeight) / 2) / 5;
    }

    update() {
        if (this.isBoom) {
            this.boom();
        } else {
            this.y += this.gravity;
            this.gravity += 0.04;
            if (this.gravity >= 0) {
                // 生成粒子数组
                const particleNumber = Math.random() * this.canvasWidth / 3 | 0;
                for (let i = 0; i < particleNumber; i++) {
                    this.particles.push(new Particle(this.x, this.y, this.color));
                }
                this.isBoom = true;
                SoundManager.burst?.play();
            }

            this.draw();
        }
    }

    draw() {
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    boom() {

        this.particles = this.particles.filter(item => {
            item.update();
            item.draw(this.ctx);
            return item.age > 0;
        });

        if (this.particles.length === 0) {
            this.notify();
        }
    }

    notify() {
        this.cb?.(this);
    }

}

class Application {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
        this.fireworks = [];
        this.init();
        this.run();
    }

    init() {
        this.fireworks.push(new Fireworks(
            this.canvas.width,
            this.canvas.height,
            this.ctx,
            this.removeFirework.bind(this)
        ));
    }

    run() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        requestAnimationFrame(() => this.run());

        for (const firework of this.fireworks) {
            firework.update();
        }

        if (Math.random() < 0.03) {
            this.fireworks.push(new Fireworks(
                this.canvas.width,
                this.canvas.height,
                this.ctx,
                this.removeFirework.bind(this)
            ));
            SoundManager.lift?.play();
        }
    }

    removeFirework(firework) {
        const index = this.fireworks.find(i => i === firework);
        if (index !== -1) {
            this.fireworks.splice(index, 1);
        }
    }
}

new Application();
