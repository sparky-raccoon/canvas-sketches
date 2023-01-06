const canvasSketch = require('canvas-sketch');
const path = require('path');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');
const _ = require('lodash');

const imageObject = new Image();
imageObject.src = path.join(__dirname, '../assets/img/earth.jpg');

const hiddenCanvas = document.createElement('canvas');
const hiddenContext = hiddenCanvas.getContext('2d');

document.getElementsByTagName('body')[0].style = "background-color:#000000;";

let imageSizes;
let imageData;
let randomizedImageData;

const params = {
    resolution: 1,
    weight: 0,
    offset: 0,
    mode: 'color',
    treshold: 0,
};

const getRandomizedImageData = (data, glitchWeight, glitchOffset) => {
    let res = [];
    const getRGBAValues = pIndex => imageData.slice(pIndex * 4 + 0, pIndex * 4 + 4);

    for (let p = 0; p < data.length / 4; p++) {
        const isGlitchCandidate = random.weightedSet([
            { value: true, weight: glitchWeight },
            { value: false, weight: 1 },
        ]);

        const offset = random.rangeFloor(-glitchOffset, glitchOffset);
        let pixelData;
        if (isGlitchCandidate && offset !== 0) {
            if (p > offset) pixelData = getRGBAValues(p - offset);
            else pixelData = getRGBAValues(p + offset);
        } else pixelData = getRGBAValues(p);

        res.push(...pixelData);
    }

    return res;
}

const createPane = (manager) => {
    const pane = new Tweakpane.Pane();
    let folder

    folder = pane.addFolder({ title: 'Image' });
    folder.addInput(params, 'resolution', { min: 1, max: 200, step: 1 });
    folder.addInput(params, 'mode', {
        options: {
            color: 'color',
            grey: 'black-and-white',
            treshold: 'treshold-on-greys',
        }
    })
    folder.addInput(params, 'treshold', { min: 0, max: 255, step: 1 });

    folder = pane.addFolder({ title: 'Glitch' });
    folder.addInput(params, 'weight', { min: 0, max: 100, step: 1 });
    folder.addInput(params, 'offset', { min: 0, max: 500, step: 1 });

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
    
            hiddenCanvas.width = cols;
            hiddenCanvas.height = rows;

            hiddenContext.drawImage(imageObject, 0, 0, cols, rows);
            imageData = hiddenContext.getImageData(0, 0, cols, rows).data;
            randomizedImageData = getRandomizedImageData(imageData, params.weight, params.offset);

            const finalCellSizeWidth = Math.floor(width / cols);
            const finalCellSizeHeight = Math.floor(height / rows);

            const wDiff = width - finalCellSizeWidth * cols;
            const hDiff = height - finalCellSizeHeight * rows;
            context.translate(wDiff/2, hDiff/2);

            for (let i = 0; i < totalCells; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const r = randomizedImageData[i * 4 + 0];
                const g = randomizedImageData[i * 4 + 1];
                const b = randomizedImageData[i * 4 + 2]; 
                const grey = (r + g + b) / 3;
                const filteredColor = grey < params.treshold ? 0 : 255;

                let pixelColor = params.mode === 'color' ? `rgb(${r}, ${g}, ${b})` :
                    params.mode === 'black-and-white' ? `rgb(${grey}, ${grey}, ${grey})` :
                    `rgb(${filteredColor}, ${filteredColor}, ${filteredColor})`;

                if (params.mode === 'treshold-on-greys' && filteredColor === 0) continue;

                context.save();
                context.translate(col * finalCellSizeWidth, row * finalCellSizeHeight);
                context.fillStyle = pixelColor;
                context.fillRect(0, 0, finalCellSizeWidth, finalCellSizeHeight);
                context.restore();
            }
        };
    }, { dimensions: [ width, height ] });
    createPane(manager);
};