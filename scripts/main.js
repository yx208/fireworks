/** @interface */
class ParticleEffect {
    update() {}
}

/** @interface */
class Particle {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    age = 0
}

/**
 * @interface
 */
class FireworkOptions {
    width = 0;
    height = 0;
    /** @type {CanvasRenderingContext2D} */
    ctx = null;
    cb = null;
    /** @class */
    effectClassName;
}

/**
 * 矩形粒子效果
 * @implements {ParticleEffect}
 */
class RectangleParticle {

    /** @type {Array<Particle>} */
    particles = [];

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} color
     * @param {CanvasRenderingContext2D} ctx
     * @param cb
     */
    constructor(x, y, color, ctx, cb) {

        this.color = color;
        this.ctx = ctx;
        this.cb = cb;

        // 生成粒子
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x,
                y,
                vx: (0.5 - Math.random()) * 100,    // 左右
                vy: (0.5 - Math.random()) * 100,    // 上下
                age: Math.random() * 100 | 0
            });
        }
    }

    /**
     * @private
     * @param {Particle} particle
     */
    draw(particle) {
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }

    update() {
        this.particles = this.particles.filter(particle => {

            particle.x += particle.vx / 20;
            particle.y += particle.vy / 20;
            // 同时改变粒子的垂直方向的值，确保粒子会向下运动
            particle.vy++;
            particle.age--;

            this.draw(particle);

            return particle.age >= 0;
        });

        if (this.particles.length <= 0) {
            this.cb?.();
        }
    }
}

/**
 * 椭圆粒子效果
 * @implements {ParticleEffect}
 */
class EllipseParticle {

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} color
     * @param {CanvasRenderingContext2D} ctx
     * @param cb
     */
    constructor(x, y, color, ctx, cb) {
        this.color = color;
        this.ctx = ctx;
        this.cb = cb;
        this.x = x;
        this.y = y;
        this.particles = [];

        // 生成一个斜椭圆
        const ellipses = generateEllipse({ longRadio: 200, shortRadio: 100, gap: 18 });
        rotateEllipse(45, ellipses);
        // 遍历椭圆每个点，得到一个直线
        const duration = 1000;
        for (let i = 0; i < ellipses.length; i++) {
            this.particles.push(lineToPoints(
                {x, y},
                {x: ellipses[i].x + x, y: ellipses[i].y + y },
                duration
            ));
        }

        this.age = duration;
        this.current = 0;
    }

    draw(particle) {
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    update() {
        if (this.current < this.age) {
            for (let i = 0; i < this.particles.length; i++) {
                this.draw(this.particles[i][this.current++]);
            }
        } else {
            this.cb?.();
        }
    }
}

class Fireworks {

    isBurst = false;

    /**
     * @param {FireworkOptions} options
     */
    constructor(options) {
        this.ctx = options.ctx;
        this.canvasWidth = options.width;
        this.canvasHeight = options.height;
        this.cb = options.cb;
        this.effectClassName = options.effectClassName;

        this.init();
    }

    init() {
        this.x = (Math.random() * (this.canvasWidth - 40) + 40) | 0;
        this.y = this.canvasHeight;
        this.color = `hsl(${Math.random() * 360 | 0}, 100%, 60%)`;
        this.gravity = -(Math.random() * Math.sqrt(this.canvasHeight) / 3 + Math.sqrt(4 * this.canvasHeight) / 2) / 5;
    }

    /**
     * 每一帧更新前都会调用这个函数
     */
    update() {
        if (this.isBurst) {
            this.effect?.update();
        } else {
            this.y += this.gravity;
            this.gravity += 0.04;
            if (this.gravity >= 0) {

                this.effect = new this.effectClassName(
                    this.x,
                    this.y,
                    this.color,
                    this.ctx,
                    this.notify.bind(this),
                );

                this.isBurst = true;
                SoundManager.burst?.play();
            }
            this.draw();
        }
    }

    draw() {
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    notify() {
        this.effect = null;
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
        this.fireworks.push(this.createFirework());
    }

    createFirework() {
        return new Fireworks({
            width: this.canvas.width,
            height: this.canvas.height,
            ctx: this.ctx,
            cb: this.removeFirework.bind(this),
            effectClassName: Math.random() > 0.5 ? EllipseParticle : RectangleParticle
        });
    }

    removeFirework(firework) {
        const index = this.fireworks.find(i => i === firework);
        if (index !== -1) {
            this.fireworks.splice(index, 1);
        }
    }

    fillMask() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateFirework() {
        for (const firework of this.fireworks) {
            firework.update();
        }

        if (Math.random() < 0.01) {
            this.fireworks.push(this.createFirework());
            SoundManager.lift?.play();
        }
    }

    run() {
        this.fillMask();
        this.updateFirework();
        requestAnimationFrame(() => this.run());
    }

}
