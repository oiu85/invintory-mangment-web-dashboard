import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

const Room2DView = ({ room, placements = [] }) => {
  const { isDark } = useTheme();
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate base scale to fit room in view
  const baseViewBox = useMemo(() => {
    const padding = 40;
    const maxWidth = 1000;
    const maxHeight = 800;
    
    const roomWidth = parseFloat(room?.width || 0);
    const roomDepth = parseFloat(room?.depth || 0);
    
    if (roomWidth === 0 || roomDepth === 0) {
      return { width: maxWidth, height: maxHeight, baseScale: 1, padding };
    }
    
    const scaleX = (maxWidth - padding * 2) / roomWidth;
    const scaleY = (maxHeight - padding * 2) / roomDepth;
    const baseScale = Math.min(scaleX, scaleY, 1);
    
    return {
      width: roomWidth * baseScale + padding * 2,
      height: roomDepth * baseScale + padding * 2,
      baseScale,
      padding,
      roomWidth,
      roomDepth,
    };
  }, [room]);

  // Apply zoom to scale
  const viewBox = useMemo(() => {
    const scale = baseViewBox.baseScale * zoom;
    return {
      ...baseViewBox,
      scale,
    };
  }, [baseViewBox, zoom]);

  const scaledPlacements = useMemo(() => {
    return placements.map(placement => ({
      ...placement,
      x: (parseFloat(placement.x_position || 0) * viewBox.scale) + viewBox.padding + pan.x,
      y: (parseFloat(placement.y_position || 0) * viewBox.scale) + viewBox.padding + pan.y,
      width: parseFloat(placement.width || 0) * viewBox.scale,
      depth: parseFloat(placement.depth || 0) * viewBox.scale,
      height: parseFloat(placement.height || 0),
      rotation: parseInt(placement.rotation || 0),
    }));
  }, [placements, viewBox, pan]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const roomWidth = parseFloat(room?.width || 0) * viewBox.scale;
  const roomDepth = parseFloat(room?.depth || 0) * viewBox.scale;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2D Top-Down View</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Zoom: {(zoom * 100).toFixed(0)}% | Scale: 1:{Math.round(1 / viewBox.scale)} | Room: {parseFloat(room?.width || 0).toFixed(0)} × {parseFloat(room?.depth || 0).toFixed(0)} cm
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
      
      <div 
        className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden cursor-move"
        style={{ minHeight: '500px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          className="border border-gray-300 dark:border-gray-600 rounded"
          style={{ minHeight: '500px', cursor: isDragging ? 'grabbing' : 'grab' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Room outline */}
          <rect
            x={viewBox.padding + pan.x}
            y={viewBox.padding + pan.y}
            width={roomWidth}
            height={roomDepth}
            fill="none"
            stroke={isDark ? "#4B5563" : "#E5E7EB"}
            strokeWidth={Math.max(1, 2 / zoom)}
            strokeDasharray="5,5"
          />
          
          {/* Room label */}
          <text
            x={viewBox.padding + roomWidth / 2 + pan.x}
            y={viewBox.padding - 10 + pan.y}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400 font-semibold"
            style={{ fontSize: `${12 / zoom}px` }}
          >
            Room Floor ({parseFloat(room?.width || 0).toFixed(0)} × {parseFloat(room?.depth || 0).toFixed(0)} cm)
          </text>

          {/* Placements */}
          {scaledPlacements.map((placement, index) => {
            // Simplified 2D mode: no rotation, always use original width/depth
            const displayWidth = placement.width;
            const displayDepth = placement.depth;

            // Color based on product (simplified, not height-based)
            const colors = [
              isDark ? "#3B82F6" : "#2563EB", // Blue
              isDark ? "#10B981" : "#059669", // Green
              isDark ? "#8B5CF6" : "#7C3AED", // Purple
              isDark ? "#F59E0B" : "#D97706", // Orange
              isDark ? "#EF4444" : "#DC2626", // Red
            ];
            const color = colors[index % colors.length];

            return (
              <g key={index}>
                {/* Placement rectangle */}
                <rect
                  x={placement.x}
                  y={placement.y}
                  width={displayWidth}
                  height={displayDepth}
                  fill={color}
                  fillOpacity="0.6"
                  stroke={isDark ? "#FFFFFF" : "#1F2937"}
                  strokeWidth="1.5"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                
                {/* Product label */}
                {displayWidth > 30 && displayDepth > 20 && (
                  <text
                    x={placement.x + displayWidth / 2}
                    y={placement.y + displayDepth / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white dark:fill-gray-100 font-semibold pointer-events-none"
                    style={{ fontSize: Math.min(displayWidth, displayDepth) / 8 }}
                  >
                    {placement.product?.name?.substring(0, 10) || `P${placement.product_id}`}
                  </text>
                )}
                
                {/* Dimensions label */}
                {displayWidth > 40 && displayDepth > 30 && (
                  <text
                    x={placement.x + displayWidth / 2}
                    y={placement.y + displayDepth / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white dark:fill-gray-200 pointer-events-none"
                    style={{ fontSize: Math.min(displayWidth, displayDepth) / 10 }}
                  >
                    {parseFloat(placement.width || 0).toFixed(0)}×{parseFloat(placement.depth || 0).toFixed(0)}
                  </text>
                )}
                
                {/* Position indicator */}
                <circle
                  cx={placement.x}
                  cy={placement.y}
                  r="3"
                  fill={isDark ? "#FBBF24" : "#D97706"}
                  stroke={isDark ? "#FFFFFF" : "#1F2937"}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke={isDark ? "#374151" : "#D1D5DB"}
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            x={viewBox.padding + pan.x}
            y={viewBox.padding + pan.y}
            width={roomWidth}
            height={roomDepth}
            fill="url(#grid)"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Legend and Controls Hint */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Position (X, Y)</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 Scroll to zoom | Click and drag to pan | Use buttons to reset
        </div>
      </div>
    </div>
  );
};

export default Room2DView;
