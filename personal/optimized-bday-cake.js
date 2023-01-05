const canvasSketch = require('canvas-sketch');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1000, 1000 ],
  animate: true,
};

const params = {
  age: 5,
  base: 5,
  safety: 5,
  hide: false,
};

const getCandlesNumberOnHexagonalRankSide = totalCandles => Math.ceil((3 + Math.sqrt(12 * totalCandles - 3)) / 6);

let cakeRadius;
const sketch = () => {
    return ({ context, width, height }) => {
        const { age, base: candleBaseRadius, safety: safetyRadius, hide: hideSafetyRadius } = params;

        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        const x = width * 0.5;
        const y = height * 0.5;
        context.translate(x, y);

        const candleCircleRadius = candleBaseRadius + safetyRadius;
        const candlesByRank = [ 1 ];
        for (let candleIndex = 2; candleIndex <= age; candleIndex++) {
            const remainingCandles = age - candleIndex + 1;
            const maxCandlesOnLastRank = (getCandlesNumberOnHexagonalRankSide(candleIndex) - 1) * 6;
            const cantFillFurtherRanks = remainingCandles < maxCandlesOnLastRank;

            if (cantFillFurtherRanks) {
                candlesByRank.push(remainingCandles);
                break;
            } else if (maxCandlesOnLastRank !== candlesByRank[candlesByRank.length - 1]) {
                candlesByRank.push(maxCandlesOnLastRank);
            }
        }

        for (let rankIndex = 0; rankIndex < candlesByRank.length; rankIndex++) {
            const totalCandlesOnRank = candlesByRank[rankIndex];
   
            for (let candleIndexOnRank = 0; candleIndexOnRank < totalCandlesOnRank; candleIndexOnRank++) {
                context.save();

                const angleBase = (2*Math.PI) / totalCandlesOnRank;
                const angle = angleBase * candleIndexOnRank;
                const distance = rankIndex * candleCircleRadius * 2;    

                context.rotate(angle);
                context.translate(distance, 0);

                context.beginPath();
                context.arc(0, 0, candleBaseRadius, 0, 2*Math.PI);
                context.stroke();

                if (!hideSafetyRadius) {
                  context.beginPath();
                  context.arc(0, 0, candleCircleRadius, 0, 2*Math.PI);
                  context.stroke();
                }

                context.restore();
            }
        }

        cakeRadius = (getCandlesNumberOnHexagonalRankSide(age) * 2 - 1) * candleCircleRadius;
        context.beginPath();
        context.arc(0, 0, cakeRadius, 0, 2*Math.PI);
        context.stroke();
    };
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder
  
  folder = pane.addFolder({ title: 'Parameters' });
  folder.addInput(params, 'age', { min: 1, max: 150, step: 1 });
  folder.addInput(params, 'base', { min: 0, max: 10 });
  folder.addInput(params, 'safety', { min: 1, max: 10 });
  folder.addInput(params, 'hide');

  pane.on('change', () => {
    console.log('cakeRadius', cakeRadius);
  })
};
  
createPane();
canvasSketch(sketch, settings);
