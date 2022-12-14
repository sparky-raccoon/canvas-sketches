const canvasSketch = require('canvas-sketch');
const load = require('load-asset');

let imageUrl = 'bday-cake.js';
let imageObject;

const sketch = ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    return () => {
        context.drawImage(imageObject, 0, 0);
    };
};

const start = async () => {
    try {
        imageObject = await load({ url: imageUrl, type: 'text' });
        canvasSketch(sketch, { dimensions: [ 1080, 1080 ]});
    }
    catch (err) {
        console.error(err);
    }
};

start();