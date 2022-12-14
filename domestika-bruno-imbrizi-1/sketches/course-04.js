const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const canvasSize = 1080;

const settings = {
  dimensions: [ canvasSize, canvasSize ],
  animate: true,
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 4,
  freq: 0.001,
  amp: 0.2,
  frame: 0,
  animate: true,
  lineCap: 'butt',
  color: '#000000',
}

const sketch = () => {
  return ({ context, width, height, frame: nativeFrame }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const { cols, rows, scaleMin, scaleMax, freq, frame: customFrame, animate, lineCap, color } = params;
    const numCells = cols * rows;
    context.strokeStyle = color;

    const margin = 0.2;
    const gridw = width * (1 - margin);
    const gridh = width * (1 - margin);
    const cellw = gridw / cols;
    const cellh = gridh / rows;
    const margx = (width - gridw) * 0.5
    const margy = (height - gridh) * 0.5;

    for (let i = 0; i < numCells; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = col * cellw + cellw * 0.5 + margx;
        const y = row * cellh + cellh * 0.5 + margy;

        context.save();

        const frame = animate ? nativeFrame : customFrame;

        // n is between -1 and 1 unless amplitude is set
        // const n = random.noise2D(x + frame * 10, y, freq, amp);
        const n = random.noise3D(x, y, frame*10, freq);
        const angle = n * Math.PI * 2;
        const scale = math.mapRange(n, -1, 1, scaleMin, scaleMax);

        context.translate(x, y);
        context.rotate(angle);
        context.lineWidth = scale;
        context.lineCap = lineCap;
        
        context.beginPath();
        context.moveTo(-cellw * (1 - margin) * 0.5, 0);
        context.lineTo(cellw * (1 - margin) * 0.5, 0);
        // context.strokeStyle = colors[i];
        context.stroke();

        context.restore();
    }
  };
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder
  
  folder = pane.addFolder({ title: 'Grid' });
  folder.addInput(params, 'color');
  folder.addInput(params, 'lineCap', { options: { butt: 'butt', round: 'round', square: 'square' }});
  folder.addInput(params, 'cols', { min: 2, max: 50, step: 1 });
  folder.addInput(params, 'rows', { min: 2, max: 50, step: 1 });
  folder.addInput(params, 'scaleMin', { min: 1, max: 100 });
  folder.addInput(params, 'scaleMax', { min: 1, max: 100 });

  folder = pane.addFolder({ title: 'Noise' });
  folder.addInput(params, 'freq', { min: -0.01, max: 0.01 });
  // folder.addInput(params, 'amp', { min: 0, max: 1 });

  folder = pane.addFolder({ title: 'Other' });
  folder.addInput(params, 'animate');
  folder.addInput(params, 'frame', { min: 0, max: 999 });
};

createPane();
canvasSketch(sketch, settings);
