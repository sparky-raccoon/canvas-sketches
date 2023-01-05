const canvasSketch = require('canvas-sketch');
const canvasSize = 2048;

const settings = {
  dimensions: [ canvasSize, canvasSize ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'white';

    const canvasDividerSize = 50;
    const padding = canvasSize * 0.1;
    const lineWidth = 4;
    const canvasDivisionSize = (canvasSize - padding*2) / canvasDividerSize;
    const availableSpace = canvasDivisionSize - 1;

    let x, y, radius, isArcDown, sAngle, eAngle;

    for (let i = 0; i < canvasDividerSize; i++) {
        for (let j = 0; j < canvasDividerSize; j++) {
            x = i+availableSpace*i+canvasDivisionSize/2+padding;
            y = j+availableSpace*j+canvasDivisionSize/2+padding;
            radius = canvasDivisionSize/2 - lineWidth;

            isArcDown = Math.random() > 0.5;
            sAngle = isArcDown ? 0 : Math.PI;
            eAngle = isArcDown ? Math.PI : 2*Math.PI;

            context.beginPath();
            context.arc(x, y, radius, sAngle, eAngle);
            context.lineWidth = lineWidth;
            context.stroke();
        }
    }
  };
};

canvasSketch(sketch, settings);
