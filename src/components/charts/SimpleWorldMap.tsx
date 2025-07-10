import React from 'react';

interface SimpleWorldMapProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
  }>;
}

export const SimpleWorldMap: React.FC<SimpleWorldMapProps> = ({ data }) => {
  // Create a simple SVG-based world map representation
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Country positions on a simplified world grid
  const countryPositions: Record<string, { x: number; y: number; w: number; h: number }> = {
    'United States': { x: 100, y: 120, w: 120, h: 80 },
    'Canada': { x: 100, y: 60, w: 120, h: 60 },
    'United Kingdom': { x: 340, y: 100, w: 40, h: 40 },
    'Germany': { x: 360, y: 110, w: 40, h: 30 },
    'France': { x: 340, y: 130, w: 40, h: 30 },
    'Japan': { x: 520, y: 130, w: 30, h: 40 },
    'Australia': { x: 500, y: 240, w: 60, h: 40 },
    'Brazil': { x: 180, y: 220, w: 80, h: 60 },
    'India': { x: 460, y: 160, w: 40, h: 40 },
    'China': { x: 480, y: 120, w: 60, h: 40 },
  };

  const getColor = (value: number) => {
    if (value === 0) return '#E5E7EB';
    const intensity = value / maxValue;
    return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
  };

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
      <svg viewBox="0 0 640 320" className="w-full h-full">
        {/* Ocean background */}
        <rect x="0" y="0" width="640" height="320" fill="#EBF5FF" className="dark:fill-gray-800" />
        
        {/* Continent outlines */}
        {/* North America */}
        <path
          d="M 80 40 Q 100 30 120 40 L 240 50 Q 260 60 250 80 L 230 180 Q 220 200 200 190 L 100 170 Q 80 160 80 140 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* South America */}
        <path
          d="M 160 200 Q 180 190 200 200 L 240 210 Q 250 220 240 240 L 200 280 Q 180 290 160 280 L 140 240 Q 130 220 140 210 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* Europe */}
        <path
          d="M 320 80 Q 340 70 360 80 L 400 90 Q 410 100 400 120 L 380 160 Q 360 170 340 160 L 320 120 Q 310 100 320 90 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* Africa */}
        <path
          d="M 340 180 Q 360 170 380 180 L 400 200 Q 410 220 400 240 L 380 280 Q 360 290 340 280 L 320 240 Q 310 220 320 200 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* Asia */}
        <path
          d="M 420 60 Q 460 50 500 60 L 560 80 Q 580 100 570 120 L 540 180 Q 520 190 480 180 L 420 160 Q 400 140 410 120 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* Australia */}
        <path
          d="M 480 230 Q 500 220 520 230 L 560 240 Q 570 250 560 270 L 540 280 Q 520 290 500 280 L 480 270 Q 470 250 480 240 Z"
          fill="#F3F4F6"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        
        {/* Country rectangles */}
        {Object.entries(countryPositions).map(([country, pos]) => {
          const countryData = data.find(d => d.name === country);
          const value = countryData?.value || 0;
          const color = getColor(value);
          
          return (
            <g key={country}>
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                fill={color}
                stroke="#4B5563"
                strokeWidth="1.5"
                className="hover:stroke-2 hover:stroke-blue-600 transition-all cursor-pointer"
              />
              {value > 0 && (
                <>
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h / 2 - 5}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700 dark:fill-gray-200"
                  >
                    {country}
                  </text>
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h / 2 + 10}
                    textAnchor="middle"
                    className="text-sm font-bold fill-blue-600 dark:fill-blue-400"
                  >
                    {value} users
                  </text>
                </>
              )}
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform="translate(20, 280)">
          <text className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">User Density:</text>
          <rect x="80" y="-10" width="20" height="15" fill="#E5E7EB" stroke="#4B5563" strokeWidth="0.5" />
          <text x="105" y="0" className="text-xs fill-gray-600 dark:fill-gray-300">No users</text>
          
          <rect x="160" y="-10" width="20" height="15" fill="rgba(59, 130, 246, 0.3)" stroke="#4B5563" strokeWidth="0.5" />
          <text x="185" y="0" className="text-xs fill-gray-600 dark:fill-gray-300">Low</text>
          
          <rect x="220" y="-10" width="20" height="15" fill="rgba(59, 130, 246, 0.6)" stroke="#4B5563" strokeWidth="0.5" />
          <text x="245" y="0" className="text-xs fill-gray-600 dark:fill-gray-300">Medium</text>
          
          <rect x="300" y="-10" width="20" height="15" fill="rgba(59, 130, 246, 1)" stroke="#4B5563" strokeWidth="0.5" />
          <text x="325" y="0" className="text-xs fill-gray-600 dark:fill-gray-300">High</text>
        </g>
      </svg>
      
      {/* Country list below map */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
        {data.slice(0, 8).map((country, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="font-medium text-gray-700 dark:text-gray-300">{country.name}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{country.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};