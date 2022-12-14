const canvasSketch = require('canvas-sketch');
const Decimal = require('decimal.js');

const settings = {
  dimensions: [ 1000, 1000 ]
};

const getCandlesNumberOnHexagonalRankSide = totalCandles => Math.ceil((3 + Math.sqrt(12 * totalCandles - 3)) / 6);

const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        const x = width * 0.5;
        const y = height * 0.5;
        context.translate(x, y);

        const age = 100;

        const candleRadius = 5;
        const candleSafeRadius = 5;
        const candleCircleRadius = candleRadius + candleSafeRadius;

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
                context.arc(0, 0, candleCircleRadius, 0, 2*Math.PI);
                context.stroke();

                context.restore();
            }
        }

        const cakeRadius = (getCandlesNumberOnHexagonalRankSide(age) * 2 - 1) * candleCircleRadius;
        context.beginPath();
        context.arc(0, 0, cakeRadius, 0, 2*Math.PI);
        context.stroke();
    };
};
  
canvasSketch(sketch, settings);