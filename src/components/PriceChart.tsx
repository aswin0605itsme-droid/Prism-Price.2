import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  currentPrice: number;
  productName: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ currentPrice, productName }) => {
  // Simulate 30 days of price data
  // Fluctuate price by +/- 10%
  const data = React.useMemo(() => {
    const history = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random fluctuation
      const fluctuation = (Math.random() - 0.5) * 0.15;
      const price = Math.round(currentPrice * (1 + fluctuation));
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: price,
      });
    }
    // Ensure last point matches current price
    history[history.length - 1].price = currentPrice;
    return history;
  }, [currentPrice]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h4 className="text-white font-bold text-lg">Price History</h4>
        <p className="text-white/50 text-xs">Last 30 days trend for {productName}</p>
      </div>
      
      <div className="flex-grow min-h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              hide={true} 
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#818cf8' }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#818cf8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Axis Labels Overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/30 px-2">
            <span>30 days ago</span>
            <span>Today</span>
        </div>
      </div>
      
      <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
          <span className="text-xs text-indigo-300">Lowest: ₹{Math.min(...data.map(d => d.price)).toLocaleString()}</span>
          <span className="text-xs text-indigo-300">Highest: ₹{Math.max(...data.map(d => d.price)).toLocaleString()}</span>
      </div>
    </div>
  );
};