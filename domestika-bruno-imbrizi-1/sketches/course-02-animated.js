const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const getSliceAgents = (x, y, sliceNumber, minRadius, maxRadius) => {
  const agents = [];
  
  for (let i = 0; i < sliceNumber; i++) {
    const slice =  math.degToRad(360 / sliceNumber);
    const angle = slice * i;
    
    agents.push(new SliceAgent(x, y, minRadius, maxRadius, slice, angle));
  }

  return agents;
}

const sketch = ({ width, height }) => {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = 100;

  const donutNums = [ 4000, 1000, 3000 ];
  const donutRatios = [ 0.5, 1.5, 2.5, 3 ];

  const slices = []
  for (let i = 0; i < donutRatios.length - 1; i++) {
    slices.push(getSliceAgents(cx, cy, donutNums[i], radius * donutRatios[i], radius * donutRatios[i+1]))
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.beginPath();
    context.arc(cy, cy, radius * donutRatios[0], 0, Math.PI*2);
    context.fillStyle = 'white';
    context.fill();

    slices.forEach(sliceAgents => {
      sliceAgents.forEach(agent => {
        agent.update();
        agent.draw(context);
      })
    })
  };
};

canvasSketch(sketch, settings);

class SliceAgent {
  constructor(cx, cy, minRadius, maxRadius, slice, angle) {
    this.cx = cx;
    this.cy = cy;
    this.radius = random.range(minRadius, maxRadius);
    this.lineWidth = random.range(1, 2);
    this.velocity = random.range(-0.01, 0.01);
    this.startingAngle = slice * random.range(0, -this.radius * 0.005);
    this.endingAngle = slice * random.range(1, this.radius * 0.005);
    this.angle = angle;
  }

  update() {
    this.startingAngle += this.velocity;
    this.endingAngle += this.velocity;
  }

  draw(context) {
    context.save();
    context.translate(this.cx, this.cy);
    context.rotate(-this.angle);
    context.lineWidth = this.lineWidth;

    context.beginPath();
    context.arc(0, 0, this.radius, this.startingAngle, this.endingAngle);
    context.strokeStyle = "white";
    context.stroke();
    context.restore();
  }
}
