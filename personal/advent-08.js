const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const load = require('load-asset');
const path = require('path');
  
const sketch = async () => {
    const data = await load({ url: path.join(__dirname, '../assets/data/advent-08.data'), type: 'text' });
    const treesMapArray = data.split('\n');
    const trees = treesMapArray.join('');
    const cols = treesMapArray[0].length;
    const rows = treesMapArray.length;

    return ({ context, width, height }) => {
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);

        const gridw = width;
        const gridh = height;
        const cellw = gridw / cols;
        const cellh = gridh / rows;

        let visible = 0;
        for (let i = 0; i < trees.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const height = trees[i];

            const x = (col + 1) * cellw - cellw * 0.5;
            const y = (row + 1) * cellh - cellh * 0.5;

            context.save();
            context.translate(x, y);

            context.beginPath();
            context.arc(0, 0, Math.min(cellw, cellh) * 0.5, 0, 2*Math.PI);
            const color = math.mapRange(height, 0, 9, 255, 0);
            context.fillStyle = `rgb(${color}, ${color}, ${color})`;
            context.strokeStyle = 'green';
            context.lineWidth = 3;
            context.fill();
            // isVisible && context.stroke();

            context.restore();
        }
    };
};

canvasSketch(sketch, { dimensions: [ 1080, 1080 ] });
  