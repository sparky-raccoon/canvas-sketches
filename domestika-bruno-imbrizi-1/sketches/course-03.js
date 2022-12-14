const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
    dimensions: [ 1080, 1080 ],
    animate: true
};

const sketch = ({ width, height }) => {
    const agents = [];
    for (let i = 0; i < 50; i++) {
        const radius = 1;
        const x = random.range(0 + radius,  width - radius);
        const y = random.range(0 + radius, height - radius);
        agents.push(new Agent(x, y, radius));
    }    

    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);


        for (let i = 0; i < agents.length - 1; i++) {
            const agent = agents[i];
            for (let j = i+1; j < agents.length; j++) {
                const other = agents[j];
                const dist = agent.pos.getDistance(other.pos);

                if (dist > 400) continue;

                context.beginPath();
                context.moveTo(agent.pos.x, agent.pos.y);
                context.lineTo(other.pos.x, other.pos.y);
                context.lineWidth = math.mapRange(dist, 0, 400, 2, 1);
                context.strokeStyle = "white";
                context.stroke();
            }
        }

        agents.forEach(agent => {
            agent.update();
            agent.draw(context);
            agent.bounce(width, height);
        });
    };
};

canvasSketch(sketch, settings);

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getDistance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx, dy * dy);
    }
}

class Agent {
    constructor(x, y, radius) {
        this.pos = new Vector(x, y, radius);
        this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
        this.radius = radius;
    }

    bounce(width, height) {
        if (this.pos.x <= this.radius || this.pos.x >= width - this.radius) this.vel.x *= -1;
        if (this.pos.y <= this.radius || this.pos.y >= height - this.radius) this.vel.y *= -1;
    }

    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    draw(context) {
        context.save();
        const { x, y } = this.pos;
        context.translate(x, y);
        context.lineWidth = 4;

        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.stroke();
        context.fill();

        context.restore();
    }
}