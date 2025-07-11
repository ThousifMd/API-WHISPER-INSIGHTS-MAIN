import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

interface WorldMapProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
    coordinates?: [number, number];
  }>;
}

// Map country names to ISO codes for proper mapping
const countryNameToISO: Record<string, string> = {
  'United States': 'USA',
  'United States of America': 'USA',
  'USA': 'USA',
  'US': 'USA',
  'United Kingdom': 'GBR',
  'UK': 'GBR',
  'Great Britain': 'GBR',
  'Germany': 'DEU',
  'Canada': 'CAN',
  'Japan': 'JPN',
  'France': 'FRA',
  'Australia': 'AUS',
  'Brazil': 'BRA',
  'India': 'IND',
  'China': 'CHN',
  'People\'s Republic of China': 'CHN',
  'South Korea': 'KOR',
  'Korea, Republic of': 'KOR',
  'Netherlands': 'NLD',
  'Spain': 'ESP',
  'Italy': 'ITA',
  'Mexico': 'MEX',
  'Russia': 'RUS',
  'Indonesia': 'IDN',
  'Saudi Arabia': 'SAU',
  'Turkey': 'TUR',
  'Argentina': 'ARG',
  'Poland': 'POL',
  'Belgium': 'BEL',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Denmark': 'DNK',
  'Finland': 'FIN',
  'Switzerland': 'CHE',
  'Austria': 'AUT',
  'Portugal': 'PRT',
  'Greece': 'GRC',
  'New Zealand': 'NZL',
  'Singapore': 'SGP',
  'Malaysia': 'MYS',
  'Thailand': 'THA',
  'Philippines': 'PHL',
  'Vietnam': 'VNM',
  'Egypt': 'EGY',
  'South Africa': 'ZAF',
  'Nigeria': 'NGA',
  'Kenya': 'KEN',
  'Morocco': 'MAR',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Peru': 'PER',
  'Venezuela': 'VEN',
  'Ukraine': 'UKR',
  'Romania': 'ROU',
  'Czech Republic': 'CZE',
  'Hungary': 'HUN',
  'Ireland': 'IRL'
};

// Coordinates for major countries (for markers)
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-95.7129, 37.0902],
  'United Kingdom': [-3.4359, 55.3781],
  'Germany': [10.4515, 51.1657],
  'Canada': [-106.3468, 56.1304],
  'Japan': [138.2529, 36.2048],
  'France': [2.2137, 46.2276],
  'Australia': [133.7751, -25.2744],
  'Brazil': [-51.9253, -14.2350],
  'India': [78.9629, 20.5937],
  'China': [104.1954, 35.8617],
  'South Korea': [127.7669, 35.9078],
  'Netherlands': [5.2913, 52.1326],
  'Spain': [-3.7492, 40.4637],
  'Italy': [12.5674, 41.8719],
  'Mexico': [-102.5528, 23.6345]
};

export const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredISO, setHoveredISO] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  // Create a map of country values for easy lookup
  const countryValues = data.reduce((acc, item) => {
    const isoCode = countryNameToISO[item.name];
    if (isoCode) {
      acc[isoCode] = item.value;
      // Also add the value for any other names that map to the same ISO
      Object.entries(countryNameToISO).forEach(([name, iso]) => {
        if (iso === isoCode) {
          acc[name] = item.value;
        }
      });
    } else {
      // If no ISO mapping found, use the name as is
      acc[item.name] = item.value;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Create reverse mapping for tooltip (prefer cleaner names)
  const isoToCountryName: Record<string, string> = {
    'USA': 'United States',
    'GBR': 'United Kingdom',
    'DEU': 'Germany',
    'CAN': 'Canada',
    'JPN': 'Japan',
    'FRA': 'France',
    'AUS': 'Australia',
    'BRA': 'Brazil',
    'IND': 'India',
    'CHN': 'China',
    'KOR': 'South Korea',
    'NLD': 'Netherlands',
    'ESP': 'Spain',
    'ITA': 'Italy',
    'MEX': 'Mexico'
  };

  // Create color scale with smoother gradients
  const maxValue = Math.max(...data.map(d => d.value));
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue / 3, (2 * maxValue) / 3, maxValue])
    .range(['#EFF6FF', '#93C5FD', '#3B82F6', '#1E40AF']);

  // Using a more reliable GeoJSON source
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-2 sm:p-4 border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
      
      {/* Tooltip */}
      {hoveredCountry && (
        <div 
          key={hoveredCountry}
          className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-fadeIn"
          style={{ minWidth: '200px' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{hoveredCountry}</p>
          </div>
        </div>
      )}
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom(Math.min(zoom * 1.5, 4))}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom / 1.5, 0.5))}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(1)}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Reset Zoom"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 100,
          center: [0, 10]
        }}
        width={800}
        height={360}
        style={{
          width: "100%",
          height: "auto",
        }}
      >
        <ZoomableGroup 
          zoom={zoom}
          onMoveEnd={(e) => {
            setZoom(e.zoom);
          }}
          minZoom={0.5}
          maxZoom={4}
          translateExtent={[[-100, -100], [900, 460]]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoCode = geo.properties.ISO_A3 || geo.properties.Alpha3 || geo.id;
                const value = countryValues[isoCode] || 0;
                const fillColor = value > 0 ? colorScale(value) : '#E5E7EB';
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#94A3B8"
                    strokeWidth={0.5}
                    onMouseEnter={() => {
                      // Ensure we're using the same ISO code as used for coloring
                      const hoveredISO = geo.properties.ISO_A3 || geo.properties.Alpha3 || geo.id;
                      
                      // Try different property names that might contain the country name
                      const geoCountryName = geo.properties.NAME || 
                                           geo.properties.name || 
                                           geo.properties.NAME_EN || 
                                           geo.properties.name_long ||
                                           geo.properties.admin ||
                                           geo.properties.ADMIN ||
                                           hoveredISO;
                      
                      console.log('Hovering country:', {
                        hoveredISO,
                        originalISO: isoCode,
                        geoCountryName,
                        properties: geo.properties,
                        value,
                        countryValuesForISO: countryValues[hoveredISO]
                      });
                      
                      // Check if we have data for this country
                      const countryData = data.find(d => {
                        const dataISO = countryNameToISO[d.name];
                        // Check if the data's ISO matches the hovered ISO
                        if (dataISO === hoveredISO) return true;
                        // Check if the data name matches the geo country name
                        if (d.name === geoCountryName) return true;
                        // Check if the geo country name maps to the same ISO as the data
                        if (countryNameToISO[geoCountryName] === dataISO) return true;
                        // Special case for USA variations
                        if (hoveredISO === 'USA' && (d.name === 'United States' || d.name === 'United States of America')) return true;
                        return false;
                      });
                      
                      // Get a clean display name
                      let displayName = isoToCountryName[hoveredISO] || geoCountryName;
                      // Normalize common country name variations for display
                      if (displayName === 'United States of America' || displayName === 'USA' || displayName === 'US') {
                        displayName = 'United States';
                      } else if (displayName === 'UK' || displayName === 'Great Britain') {
                        displayName = 'United Kingdom';
                      } else if (displayName === 'People\'s Republic of China') {
                        displayName = 'China';
                      } else if (displayName === 'Korea, Republic of') {
                        displayName = 'South Korea';
                      }
                      
                      // Use the actual data from the countryData if found, otherwise check countryValues
                      let userCount = 0;
                      if (countryData) {
                        userCount = countryData.value;
                      } else if (countryValues[hoveredISO]) {
                        userCount = countryValues[hoveredISO];
                      }
                      
                      console.log('Country hover data:', {
                        displayName,
                        hoveredISO,
                        countryData,
                        userCount,
                        countryValues
                      });
                      
                      setHoveredCountry(userCount > 0 ? `${displayName}: ${userCount} users` : `${displayName}: No users`);
                      setHoveredISO(hoveredISO);
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setHoveredISO(null);
                    }}
                    style={{
                      default: {
                        outline: 'none',
                        stroke: '#94A3B8',
                        strokeWidth: 0.5,
                        transition: 'all 0.3s ease',
                      },
                      hover: {
                        fill: hoveredISO === isoCode ? (value > 0 ? '#2563EB' : '#FB923C') : (value > 0 ? '#60A5FA' : '#FED7AA'),
                        outline: 'none',
                        cursor: 'pointer',
                        stroke: hoveredISO === isoCode ? '#1F2937' : '#475569',
                        strokeWidth: hoveredISO === isoCode ? 2 : 1,
                        transition: 'all 0.3s ease',
                      },
                      pressed: {
                        fill: '#F87171',
                        outline: 'none',
                        stroke: '#475569',
                        strokeWidth: 1,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {/* Add markers for countries with data */}
          {data.map((country) => {
            const coordinates = countryCoordinates[country.name];
            if (!coordinates || country.name === 'Others') return null;
            
            return (
              <Marker key={country.name} coordinates={coordinates}>
                <g>
                  <circle
                    r={Math.sqrt(country.value) * 4 / Math.sqrt(zoom)}
                    fill="#EF4444"
                    fillOpacity={0.7}
                    stroke="#FFFFFF"
                    strokeWidth={2 / Math.sqrt(zoom)}
                    style={{ transition: 'all 0.3s ease' }}
                    className="hover:fill-opacity-90"
                  />
                  <text
                    textAnchor="middle"
                    y={5 / Math.sqrt(zoom)}
                    style={{
                      fontSize: `${14 / Math.sqrt(zoom)}px`,
                      fill: '#FFFFFF',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}
                  >
                    {country.value}
                  </text>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-2 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-sm font-medium text-muted-foreground">No users</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #EFF6FF, #3B82F6, #1E40AF)' }}></div>
          <span className="text-sm font-medium text-muted-foreground">User density</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-red-500 rounded-full opacity-70 border-2 border-white"></div>
          <span className="text-sm font-medium text-muted-foreground">User count (size = volume)</span>
        </div>
      </div>
    </div>
  );
};