const canvasSketch = require('canvas-sketch');
const path = require('path');
const random = require('canvas-sketch-util/random');

const imageObject = new Image();
imageObject.src = path.join(__dirname, '../assets/img/lords_prayer.jpg');

const hiddenCanvas = document.createElement('canvas');
const hiddenContext = hiddenCanvas.getContext('2d');

document.getElementsByTagName('body')[0].style = "background-color:#000000;";

let imageSizes;
let imageData;

const params = {
    resolution: 10,
};

imageObject.onload = async () => {
    const { width, height } = imageObject;
    imageSizes = { width, height };

    canvasSketch(({ context }) => {    
        return () => {
            context.fillStyle = 'black';
            context.fillRect(0, 0, width, height);
            context.textBaseline = 'middle';

            const cellSize = params.resolution;
            const cols = Math.floor(width / cellSize);
            const rows = Math.floor(height / cellSize);
            const totalCells = cols * rows;
    
            hiddenCanvas.width = cols;
            hiddenCanvas.height = rows;

            hiddenContext.drawImage(imageObject, 0, 0, cols, rows);
            imageData = hiddenContext.getImageData(0, 0, cols, rows).data;

            const finalCellSizeWidth = Math.floor(width / cols);
            const finalCellSizeHeight = Math.floor(height / rows);
            const minCellSize = Math.min(finalCellSizeWidth, finalCellSizeHeight);

            const wDiff = width - finalCellSizeWidth * cols;
            const hDiff = height - finalCellSizeHeight * rows;
            context.translate(wDiff/2, hDiff/2);
            console.log(totalCells);

            for (let i = 0; i < totalCells; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const r = imageData[i * 4 + 0];
                const g = imageData[i * 4 + 1];
                const b = imageData[i * 4 + 2]; 
                const grey = (r + g + b) / 3;
                const filteredColor = grey < 75 ? 0 : 255;
                // const multiplier = 2.2;

                if (filteredColor !== 0) {
                    context.save();
                    context.translate(col * finalCellSizeWidth, row * finalCellSizeHeight);
                    context.beginPath();
                    context.fillStyle = '#8bff85';
                    // context.fillStyle = `rgb(${r*multiplier}, ${g*multiplier}, ${b*multiplier})`;
                    // context.arc(finalCellSizeWidth / 2, finalCellSizeHeight / 2, minCellSize / 2, 0, 2*Math.PI);
                    // context.fill();
                    context.font = `${minCellSize}px monospace`;
                    context.fillText(random.pick(['0', '1']), finalCellSizeWidth / 2, finalCellSizeHeight / 2);
                    context.restore();
                }
            }
        };
    }, { dimensions: [ width, height ] });
};