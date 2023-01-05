const canvasSketch = require('canvas-sketch');
const path = require('path');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');
const _ = require('lodash');

const imageObject = new Image();
imageObject.src = path.join(__dirname, '../assets/img/earth.jpeg');

const hiddenCanvas = document.createElement('canvas');
const hiddenContext = hiddenCanvas.getContext('2d');

let imageSizes;
let imageData;
let randomizedImageData;

document.getElementsByTagName('body')[0].style = "background-color:#050505;";

const params = {
    resolution: 20,
    weight: 2,
    offset: 3,
};

const getRandomizedImageData = (data, glitchWeight, glitchOffset) => {
    let res = [];
    const getRGBAValues = pIndex => imageData.slice(pIndex * 4 + 0, pIndex * 4 + 4);

    for (let p = 0; p < data.length / 4; p++) {
        const isGlitchCandidate = random.weightedSet([
            { value: true, weight: glitchWeight },
            { value: false, weight: 1 },
        ]);

        const offset = random.rangeFloor(1, glitchOffset);
        const pixelData = isGlitchCandidate && p > offset ? getRGBAValues(p-offset) : getRGBAValues(p);

        res.push(...pixelData);
    }

    return res;
}

const createPane = (manager) => {
    const pane = new Tweakpane.Pane();
    let folder

    folder = pane.addFolder({ title: 'Grid' });
    folder.addInput(params, 'resolution', { min: 1, max: 400, step: 1 });

    folder = pane.addFolder({ title: 'Glitch' });
    folder.addInput(params, 'weight', { min: 0, max: 100, step: 1 });
    folder.addInput(params, 'offset', { min: 1, max: 100, step: 1 });

    pane.on('change', _.debounce(() => manager.render(), 1000));
};

imageObject.onload = async () => {
    const { width, height } = imageObject;
    imageSizes = { width, height };

    const manager = await canvasSketch(({ context }) => {    
        return () => {
            context.fillStyle = 'black';
            context.fillRect(0, 0, width, height);

            const cellSize = params.resolution;
            const cols = Math.floor(width / cellSize);
            const rows = Math.floor(height / cellSize);
            const totalCells = cols * rows;
    
            console.log(cellSize);
    
            hiddenCanvas.width = cols;
            hiddenCanvas.height = rows;

            console.time('getImageData');
            hiddenContext.drawImage(imageObject, 0, 0, cols, rows);
            imageData = hiddenContext.getImageData(0, 0, cols, rows).data;
            randomizedImageData = getRandomizedImageData(imageData, params.weight, params.offset);
            console.timeEnd('getImageData');

            // let rValues = [];

            const finalCellSizeWidth = cellSize // Math.ceil(width / cols);
            const finalCellSizeHeight = cellSize // Math.ceil(height / rows);

            console.time('context.fillRect');
            for (let i = 0; i < totalCells; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const r = randomizedImageData[i * 4 + 0];
                const g = randomizedImageData[i * 4 + 1];
                const b = randomizedImageData[i * 4 + 2]; 
                const grey = (r + g + b) / 3;
                // rValues.push(grey);

                context.save();
                context.translate(col * finalCellSizeWidth, row * finalCellSizeHeight);
                const filteredColor = grey < 45 ? 0 : 255;
                // context.fillStyle = `rgb(${filteredColor}, ${filteredColor}, ${filteredColor})`;
                // context.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
                context.fillStyle = `rgb(${r}, ${g}, ${b})`;
                context.fillRect(0, 0, finalCellSizeWidth, finalCellSizeHeight);
                context.restore();
            }
            console.timeEnd('context.fillRect');

            // console.log('canvas size', width, height);
            // console.log('image size', cols * cellSize, rows * cellSize);
            /* console.log('average grey', rValues.reduce((acc, value) => {
                return acc + (value / rValues.length)
            }, 0)) */
        };
    }, { dimensions: [ width, height ], animate: false });
    createPane(manager);
};