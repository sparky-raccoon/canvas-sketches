const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

let manager;
let text = 'A';
let fontFamily = 'monospace';

// Create a separate canvas
const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const getGlyph = v => {
    if (v < 50) return '';
    if (v < 100) return '.';
    if (v < 150) return '-';
    if (v < 200) return '+';

    const glyphs = '“‘“ë†{¶«¶{¡¡«ÇøÇ¡'.split('');
    return random.pick(glyphs);
}

const sketch = ({ context, width, height }) => {
    const cell = 20;
    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const numCells = cols * rows;

    typeCanvas.width = cols;
    typeCanvas.height = rows;  

    return () => {  
        // Reset
        typeContext.fillStyle = "black";
        typeContext.fillRect(0, 0, width, height);

        typeContext.fillStyle = "white";
        typeContext.font = `${cols*1}px ${fontFamily}`;
        typeContext.textBaseline = 'top';

        const metrics = typeContext.measureText(text);
        const mx = metrics.actualBoundingBoxLeft * -1;
        const my = metrics.actualBoundingBoxAscent * -1;
        const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const tx = (cols - mw) * 0.5 - mx;
        const ty = (rows - mh) * 0.5 - my;

        typeContext.save();
        typeContext.translate(tx, ty);

        typeContext.beginPath();
        typeContext.moveTo(0, 0);
        typeContext.lineTo(rows, 0);
        typeContext.stroke();

        typeContext.beginPath();
        typeContext.rect(mx, my, mw, mh);
        typeContext.stroke();

        typeContext.fillText(text, 0, 0);
        typeContext.restore();

        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
        context.textBaseline = 'middle';
        context.textAlign ='center';

        const typeData = typeContext.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < numCells; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = col * cell;
            const y = row * cell;

            // RGBA has 4 channels.
            const r = typeData[i * 4 + 0];
            const g = typeData[i * 4 + 1];
            const b = typeData[i * 4 + 2];
            // const a = typeData[i * 4 + 3];

            context.save();
            context.translate(x + cell*0.5, y + cell*0.5);

            // Pixelated view of letter.
            // context.fillStyle = `rgb(${r}, ${g}, ${b})`;
            // context.fillRect(0, 0, cell, cell);

            // Filled with glyphs.
            const glyph = getGlyph(r);
            context.font = `${cell * random.pick([0.5, 1, 5])}px ${fontFamily}`;
            context.fillStyle = 'white';
            context.fillText(glyph, 0, 0);

            context.restore();
        }

        // Image ref. Is hidden in the main canvas but exists in the separate one.
        context.drawImage(typeCanvas, 0, 0, cell*3, cell*3);
    };
};

document.addEventListener('keydown', (ev) => {
    text = ev.key.toUpperCase();
    manager.render();
});

const start = async () => {
    manager = await canvasSketch(sketch, {
        dimensions: [ 1080, 1080 ],
    });
}

start();