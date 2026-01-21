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
          opacity={0.9} // Slightly more opaque for better visibility
          transparent
          metalness={0.3} // Slightly more metallic for better reflection
          roughness={0.4} // Smoother surface
          emissive={adjustedColor} // Subtle glow
          emissiveIntensity={0.1} // Low emissive for subtle glow
        />
      </mesh>
      
      {/* Wireframe outline for layer separation */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(displayWidth, layerHeight, displayDepth)]} />
        <lineBasicMaterial color="#000000" opacity={0.4} transparent linewidth={2} />
      </lineSegments>
      
      {/* Product name label on top of stack (with increased spacing) */}
      {layerIndex === totalLayers - 1 && layerHeight > 0.05 && (
        <Text
          position={[0, layerHeight / 2 + 0.08, 0]} // Increased from 0.02 to 0.08 for better spacing
          fontSize={Math.min(0.1, displayWidth / 8)} // Slightly larger font
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom" // Changed to bottom for better positioning
          outlineWidth={0.015} // Thicker outline for better readability
          outlineColor="#000000"
          maxWidth={displayWidth * 0.9} // Prevent text overflow
        >
          {placement.product?.name?.substring(0, 15) || `Product ${productId}`}
        </Text>
      )}
      
      {/* Layer indicator on side (with better spacing) */}
      {totalLayers > 1 && (
        <Text
          position={[displayWidth / 2 + 0.08, layerHeight / 2, 0]} // Increased spacing from 0.05 to 0.08
          fontSize={0.05} // Slightly larger
          color="#FFFFFF"
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.008} // Thicker outline
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
const RoomFloor = ({ roomWidth, roomDepth, roomHeight, door = null }) => {
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

      {/* Door visualization */}
      {door && (
        <group>
          <mesh
            position={[
              (door.x / 100) + (door.width / 100) / 2,
              (door.height / 100) / 2,
              door.wall === 'north' ? 0.05 : door.wall === 'south' ? depth - 0.05 : (door.y / 100) + (door.depth / 100) / 2
            ]}
            rotation={door.wall === 'east' || door.wall === 'west' ? [0, Math.PI / 2, 0] : [0, 0, 0]}
          >
            <boxGeometry args={[door.width / 100, door.height / 100, 0.15]} />
            <meshStandardMaterial color="#FFA500" opacity={0.8} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Scene component
const Scene = ({ room, placements, door = null }) => {
  const controlsRef = useRef();
  const roomWidth = parseFloat(room?.width || 0) / 100;
  const roomDepth = parseFloat(room?.depth || 0) / 100;
  const roomHeight = parseFloat(room?.height || 0) / 100;

  // Calculate camera position to view entire room (closer initial view)
  const maxDimension = Math.max(roomWidth, roomDepth, roomHeight);
  const cameraDistance = maxDimension * 1.8; // Closer initial view (was 2.5)

  // Smooth camera updates for damping
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

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
      {/* Enhanced Lighting for better visibility */}
      <ambientLight intensity={0.7} /> {/* Increased for better base lighting */}
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow /> {/* Brighter main light */}
      <directionalLight position={[-10, 15, -10]} intensity={0.8} /> {/* Better fill light */}
      <pointLight position={[0, 25, 0]} intensity={0.6} /> {/* Brighter top light */}
      <spotLight position={[roomWidth / 2, roomHeight * 1.5, roomDepth / 2]} angle={0.4} intensity={0.5} penumbra={0.5} />

      {/* Room structure */}
      <RoomFloor
        roomWidth={parseFloat(room?.width || 0)}
        roomDepth={parseFloat(room?.depth || 0)}
        roomHeight={parseFloat(room?.height || 0)}
        door={door}
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

      {/* Camera with better initial positioning */}
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, cameraDistance * 0.7, cameraDistance]}
        fov={55} // Slightly wider field of view for better visibility
      />
      
      {/* Enhanced Controls with improved zoom range and closer minimum distance */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={maxDimension * 0.2} // Can zoom in much closer (was 0.5)
        maxDistance={maxDimension * 15} // Can zoom out much farther (was 10)
        zoomSpeed={1.5} // Faster zoom (was 1.2)
        panSpeed={1.0} // Smoother panning (was 0.8)
        rotateSpeed={1.0} // Smoother rotation (was 0.8)
        minPolarAngle={0} // Allow looking from top
        maxPolarAngle={Math.PI} // Allow looking from bottom
        dampingFactor={0.05} // Smooth damping
        enableDamping={true} // Enable smooth camera movement
      />
      
      {/* Enhanced Grid helper */}
      <gridHelper 
        args={[Math.max(roomWidth, roomDepth) * 2, 50, '#666666', '#333333']} 
        position={[roomWidth / 2, 0, roomDepth / 2]}
      />
    </>
  );
};

const Room3DView = ({ room, placements = [], door = null }) => {
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
        <Canvas 
          shadows 
          gl={{ 
            antialias: true, // Enable antialiasing for smoother edges
            alpha: false, // Better performance
            powerPreference: "high-performance" // Use dedicated GPU if available
          }}
          camera={{ fov: 55, near: 0.1, far: 1000 }}
        >
          <Scene room={room} placements={placements} door={door || room?.door} />
        </Canvas>
      </div>

      {/* Enhanced Controls hint */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>🖱️ <strong>Left click + drag</strong> to rotate | <strong>Scroll</strong> to zoom (can zoom very close) | <strong>Right click + drag</strong> to pan</p>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
          💡 Zoom in close to see product labels and layer indicators clearly
        </div>
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
