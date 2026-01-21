import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

// Individual item component (single layer in a stack)
const ItemBox = ({ placement, roomHeight, layerIndex, totalLayers }) => {
  const meshRef = useRef();
  
  const width = parseFloat(placement.width || 0) / 100; // Convert cm to meters for scale
  const depth = parseFloat(placement.depth || 0) / 100;
  const height = parseFloat(placement.height || 0) / 100;
  
  const x = parseFloat(placement.x_position || 0) / 100;
  const y = parseFloat(placement.y_position || 0) / 100;
  const z = parseFloat(placement.z_position || 0) / 100; // Convert cm to meters
  
  const layerHeight = height;
  const zPosition = z; // Use actual z_position from placement
  
  const displayWidth = width;
  const displayDepth = depth;

  // Color based on product_id hash for consistent, unique colors per product
  const productId = parseInt(placement.product_id || 0);
  
  // Generate consistent color from product_id using hash
  const hashColor = (id) => {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
      '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
      '#A855F7', '#F43F5E', '#0EA5E9', '#22C55E', '#EAB308'
    ];
    // Use a simple hash to distribute colors
    const hash = ((id * 2654435761) >>> 0) % colors.length;
    return colors[hash];
  };
  
  const baseColor = hashColor(productId);
  
  // Slightly darker for lower layers, lighter for upper layers
  const layerBrightness = 1.0 - (layerIndex * 0.08);
  const adjustedColor = new THREE.Color(baseColor).multiplyScalar(Math.max(0.7, layerBrightness));

  return (
    <group
      position={[x + displayWidth / 2, zPosition + layerHeight / 2, y + displayDepth / 2]}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[displayWidth, layerHeight, displayDepth]} />
        <meshStandardMaterial
          color={adjustedColor}
          opacity={0.85}
          transparent
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      
      {/* Wireframe outline for layer separation */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(displayWidth, layerHeight, displayDepth)]} />
        <lineBasicMaterial color="#000000" opacity={0.4} transparent linewidth={2} />
      </lineSegments>
      
      {/* Layer number label on top of each box */}
      {layerIndex === totalLayers - 1 && layerHeight > 0.05 && (
        <Text
          position={[0, layerHeight / 2 + 0.02, 0]}
          fontSize={Math.min(0.08, displayWidth / 10)}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {placement.product?.name?.substring(0, 12) || `P${productId}`}
        </Text>
      )}
      
      {/* Layer indicator on side */}
      {totalLayers > 1 && (
        <Text
          position={[displayWidth / 2 + 0.05, layerHeight / 2, 0]}
          fontSize={0.04}
          color="#FFFFFF"
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          L{layerIndex + 1}
        </Text>
      )}
    </group>
  );
};

// Stack component - groups items of the same product at the same position
const ItemStack = ({ placements, roomHeight, productId }) => {
  // Sort by z_position to stack correctly
  const sortedPlacements = [...placements].sort((a, b) => 
    parseFloat(a.z_position || 0) - parseFloat(b.z_position || 0)
  );
  
  return (
    <group>
      {sortedPlacements.map((placement, index) => (
        <ItemBox
          key={`${placement.id || placement.product_id || index}_${placement.z_position || index}`}
          placement={placement}
          roomHeight={roomHeight}
          layerIndex={index}
          totalLayers={sortedPlacements.length}
        />
      ))}
    </group>
  );
};

// Room floor component
const RoomFloor = ({ roomWidth, roomDepth, roomHeight }) => {
  const width = roomWidth / 100;
  const depth = roomDepth / 100;
  const height = roomHeight / 100;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#E5E7EB" opacity={0.5} transparent />
      </mesh>
      
      {/* Walls */}
      {/* Back wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#9CA3AF" opacity={0.3} transparent />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[depth, height, 0.1]} />
        <meshStandardMaterial color="#9CA3AF" opacity={0.3} transparent />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[width, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[depth, height, 0.1]} />
        <meshStandardMaterial color="#9CA3AF" opacity={0.3} transparent />
      </mesh>
      
      {/* Front wall (transparent for viewing) */}
      <mesh position={[width / 2, height / 2, depth]} receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#9CA3AF" opacity={0.1} transparent />
      </mesh>
    </group>
  );
};

// Scene component
const Scene = ({ room, placements }) => {
  const roomWidth = parseFloat(room?.width || 0) / 100;
  const roomDepth = parseFloat(room?.depth || 0) / 100;
  const roomHeight = parseFloat(room?.height || 0) / 100;

  // Calculate camera position to view entire room
  const maxDimension = Math.max(roomWidth, roomDepth, roomHeight);
  const cameraDistance = maxDimension * 2.5;

  // Group placements by exact product_id AND exact position (x, y) to create stacks
  // Only items with EXACT same product_id AND EXACT same position are stacked
  const groupedStacks = useMemo(() => {
    const groups = new Map();
    
    placements.forEach((placement) => {
      const x = parseFloat(placement.x_position || 0);
      const y = parseFloat(placement.y_position || 0);
      const productId = parseInt(placement.product_id || 0);
      
      // Create unique key: exact product_id + exact position (no tolerance)
      // Round to 2 decimal places to handle floating point precision
      const key = `${productId}_${x.toFixed(2)}_${y.toFixed(2)}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(placement);
    });
    
    // Sort each group by z_position to ensure correct stacking order
    groups.forEach((groupPlacements) => {
      groupPlacements.sort((a, b) => {
        const za = parseFloat(a.z_position || 0);
        const zb = parseFloat(b.z_position || 0);
        return za - zb;
      });
    });
    
    return Array.from(groups.entries());
  }, [placements]);

  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />
      <pointLight position={[0, 20, 0]} intensity={0.4} />

      {/* Room structure */}
      <RoomFloor
        roomWidth={parseFloat(room?.width || 0)}
        roomDepth={parseFloat(room?.depth || 0)}
        roomHeight={parseFloat(room?.height || 0)}
      />

      {/* Placements grouped into stacks */}
      {groupedStacks.map(([key, stackPlacements], index) => {
        const firstPlacement = stackPlacements[0];
        return (
          <ItemStack
            key={key}
            placements={stackPlacements}
            roomHeight={parseFloat(room?.height || 0)}
            productId={firstPlacement.product_id}
          />
        );
      })}

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, cameraDistance * 0.8, cameraDistance]}
        fov={50}
      />
      
      {/* Enhanced Controls with increased zoom range */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={maxDimension * 0.5} // Can zoom in much closer
        maxDistance={maxDimension * 10} // Can zoom out much farther
        zoomSpeed={1.2} // Faster zoom
        panSpeed={0.8}
        rotateSpeed={0.8}
        minPolarAngle={0} // Allow looking from top
        maxPolarAngle={Math.PI} // Allow looking from bottom
      />
      
      {/* Enhanced Grid helper */}
      <gridHelper 
        args={[Math.max(roomWidth, roomDepth) * 2, 50, '#666666', '#333333']} 
        position={[roomWidth / 2, 0, roomDepth / 2]}
      />
    </>
  );
};

const Room3DView = ({ room, placements = [] }) => {
  const { isDark } = useTheme();

  if (!room || !placements || placements.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No placements to visualize</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Generate a layout to see 3D visualization</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3D Visualization</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Room: {parseFloat(room.width || 0).toFixed(0)} × {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} cm
        </div>
      </div>
      
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px', minHeight: '400px' }}>
        <Canvas shadows>
          <Scene room={room} placements={placements} />
        </Canvas>
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>🖱️ Left click + drag to rotate | Scroll to zoom | Right click + drag to pan</p>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded border border-gray-300 dark:border-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Product Stacks (Layers)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Each square shows stacked boxes - each layer = one product box
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room3DView;
