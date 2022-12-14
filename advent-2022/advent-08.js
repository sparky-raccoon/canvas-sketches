const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const load = require('load-asset');
  
const sketch = async () => {
    const data = await load({ url: 'advent-08.data', type: 'text' });
    const treesMapArray = data.split('\n');
    const trees = treesMapArray.join('');
    const cols = treesMapArray[0].length;
    const rows = treesMapArray.length;

    const getCol = index => index % cols;
    const getRow = index => Math.floor(index / cols);

    const checkVisibilityRegardingSurroundingTrees = (direction, treeInfo) => {
        const {
            index: treeIndex,
            mapPosition: { row: treeRow },
            height: treeHeight,
        } = treeInfo;

        let isVisible = true;
        let cursor, edgeCondition;
        switch (direction) {
            case 'top': {
                cursor = index => index - cols;
                edgeCondition = index => index > 0;
                break;
            }
            case 'left': {
                cursor = index => index - 1;
                edgeCondition = index => getCol(index) >= 0 && (getRow(index) === treeRow);
                break;
            }
            case 'right': {
                cursor = index => index + 1;
                edgeCondition = index => (getCol(index) < cols) && (getRow(index) === treeRow);
                break;
            }
            case 'bottom': {
                cursor = index => index + cols;
                edgeCondition = index => index < trees.length;
                break;
            }
        }

        for (let st = cursor(treeIndex); edgeCondition(st) ; st = cursor(st)) {
            const surrTreeHeight = parseInt(trees[st]);
            if (surrTreeHeight >= treeHeight) {
                isVisible = false;
                break;
            }
        }

        return isVisible;
    }

    const getTreeVisibility = t => {
        const col = t % cols;
        const row = Math.floor(t / cols);

        if (col === 0 || col === cols - 1 || row === 0 || row === rows - 1) return true;
        else {
            const directions = [ 'top', 'right', 'bottom', 'left' ];
            const treeInfo = {
                index: t,
                mapPosition: { col, row },
                height: parseInt(trees[t]),
            };

            if (treeInfo.height !== 0) {
                for (let d = 0; d < directions.length; d++) {
                    if (checkVisibilityRegardingSurroundingTrees(directions[d], treeInfo)) return true;
                }
            }

            return false;
        }
    }

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

            const isVisible = getTreeVisibility(i);
            if (isVisible) visible++;

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

        console.log(visible);
    };
};

canvasSketch(sketch, { dimensions: [ 1080, 1080 ] });
  