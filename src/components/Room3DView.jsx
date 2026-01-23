import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
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
        <lineBasicMaterial color="#000000" opacity={0.4} transparent lineWidth={2} />
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
// Compass component for 3D view
const Compass = ({ roomWidth, roomDepth, roomHeight }) => {
  const width = roomWidth / 100;
  const depth = roomDepth / 100;
  const height = roomHeight / 100;
  const compassSize = Math.min(width, depth) * 0.15;
  const compassHeight = height * 0.1;
  
  return (
    <group position={[width - compassSize * 0.6, compassHeight, depth - compassSize * 0.6]}>
      {/* Compass base */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[compassSize * 0.5, compassSize * 0.5, 0.02, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Compass needle pointing North */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[compassSize * 0.3, 0.01, compassSize * 0.1]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
      </mesh>
      
      {/* North label */}
      <Html position={[0, 0.05, -compassSize * 0.3]} center>
        <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          N
        </div>
      </Html>
      
      {/* South label */}
      <Html position={[0, 0.05, compassSize * 0.3]} center>
        <div className="bg-red-600/90 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          S
        </div>
      </Html>
      
      {/* East label */}
      <Html position={[compassSize * 0.3, 0.05, 0]} center>
        <div className="bg-green-600/90 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          E
        </div>
      </Html>
      
      {/* West label */}
      <Html position={[-compassSize * 0.3, 0.05, 0]} center>
        <div className="bg-yellow-600/90 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          W
        </div>
      </Html>
      
      {/* Direction lines - North-South */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.005, 0.005, compassSize * 0.8]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Direction lines - East-West */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <boxGeometry args={[0.005, 0.005, compassSize * 0.8]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

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

      {/* Door visualization with unique highlighting */}
      {door && door.x && door.y && door.width && door.height && (() => {
        console.log('Rendering door in RoomFloor:', door);
        const doorX = parseFloat(door.x) / 100;
        const doorY = parseFloat(door.y) / 100;
        const doorWidth = parseFloat(door.width) / 100;
        const doorHeight = parseFloat(door.height) / 100;
        const doorWall = door.wall || 'north';
        
        // Calculate position based on wall
        let positionX, positionY, positionZ, rotation;
        if (doorWall === 'north') {
          positionX = doorX + doorWidth / 2;
          positionY = doorHeight / 2;
          positionZ = 0.05;
          rotation = [0, 0, 0];
        } else if (doorWall === 'south') {
          positionX = doorX + doorWidth / 2;
          positionY = doorHeight / 2;
          positionZ = depth - 0.05;
          rotation = [0, 0, 0];
        } else if (doorWall === 'east') {
          positionX = depth - 0.05;
          positionY = doorHeight / 2;
          positionZ = doorY + doorWidth / 2;
          rotation = [0, Math.PI / 2, 0];
        } else { // west
          positionX = 0.05;
          positionY = doorHeight / 2;
          positionZ = doorY + doorWidth / 2;
          rotation = [0, Math.PI / 2, 0];
        }
        
        return (
          <group key={`door-${door.x}-${door.y}-${door.width}-${door.height}-${doorWall}`}>
            {/* Glowing outline effect */}
            <mesh
              position={[positionX, positionY, positionZ]}
              rotation={rotation}
            >
              <boxGeometry args={[doorWidth + 0.02, doorHeight + 0.02, 0.18]} />
              <meshStandardMaterial 
                color="#FF6B00" 
                emissive="#FF6B00"
                emissiveIntensity={0.5}
                opacity={0.4} 
                transparent 
              />
            </mesh>
            
            {/* Main door with gradient-like effect */}
            <mesh
              position={[positionX, positionY, positionZ]}
              rotation={rotation}
            >
              <boxGeometry args={[doorWidth, doorHeight, 0.15]} />
              <meshStandardMaterial 
                color="#FF8C00" 
                emissive="#FFA500"
                emissiveIntensity={0.3}
                metalness={0.3}
                roughness={0.4}
                opacity={0.9} 
                transparent 
              />
            </mesh>
            
            {/* Corner markers */}
            {doorWall === 'north' || doorWall === 'south' ? (
              <>
                <mesh position={[doorX / 100, positionY, positionZ]} rotation={rotation}>
                  <boxGeometry args={[0.02, 0.02, 0.2]} />
                  <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={1} />
                </mesh>
                <mesh position={[(doorX + doorWidth) / 100, positionY, positionZ]} rotation={rotation}>
                  <boxGeometry args={[0.02, 0.02, 0.2]} />
                  <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={1} />
                </mesh>
              </>
            ) : (
              <>
                <mesh position={[positionX, positionY, doorY / 100]} rotation={rotation}>
                  <boxGeometry args={[0.02, 0.02, 0.2]} />
                  <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={1} />
                </mesh>
                <mesh position={[positionX, positionY, (doorY + doorWidth) / 100]} rotation={rotation}>
                  <boxGeometry args={[0.02, 0.02, 0.2]} />
                  <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={1} />
                </mesh>
              </>
            )}
            
            {/* Floating label above door */}
            <Html
              position={[positionX, positionY + doorHeight / 2 + 0.1, positionZ]}
              center
              distanceFactor={10}
            >
              <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded-lg shadow-lg border-2 border-orange-400 font-bold text-xs whitespace-nowrap animate-pulse">
                🚪 DOOR
              </div>
            </Html>
          </group>
        );
      })()}
    </group>
  );
};

// Scene component
const Scene = ({ room, placements, door = null }) => {
  const controlsRef = useRef();
  const roomWidth = parseFloat(room?.width || 0) / 100;
  const roomDepth = parseFloat(room?.depth || 0) / 100;
  const roomHeight = parseFloat(room?.height || 0) / 100;

  // Debug logging
  useEffect(() => {
    console.log('Scene component rendered:', {
      roomWidth,
      roomDepth,
      roomHeight,
      placementsCount: placements?.length || 0
    });
  }, [roomWidth, roomDepth, roomHeight, placements]);

  // Validate dimensions
  if (roomWidth <= 0 || roomDepth <= 0 || roomHeight <= 0) {
    console.warn('Invalid room dimensions in Scene:', { roomWidth, roomDepth, roomHeight });
    return null;
  }

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

  // Ensure we have valid dimensions
  if (roomWidth <= 0 || roomDepth <= 0 || roomHeight <= 0) {
    console.warn('Invalid room dimensions in Scene:', { roomWidth, roomDepth, roomHeight });
    return null;
  }

  return (
    <>
      {/* Enhanced Lighting for better visibility */}
      <ambientLight intensity={0.7} /> {/* Increased for better base lighting */}
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow /> {/* Brighter main light */}
      <directionalLight position={[-10, 15, -10]} intensity={0.8} /> {/* Better fill light */}
      <pointLight position={[0, 25, 0]} intensity={0.6} /> {/* Brighter top light */}
      <spotLight position={[roomWidth / 2, roomHeight * 1.5, roomDepth / 2]} angle={0.4} intensity={0.5} penumbra={0.5} />
      
      {/* Room structure - Always render */}
      <RoomFloor
        roomWidth={parseFloat(room?.width || 0)}
        roomDepth={parseFloat(room?.depth || 0)}
        roomHeight={parseFloat(room?.height || 0)}
        door={door || room?.door || null}
      />
      
      {/* Compass for orientation */}
      <Compass
        roomWidth={parseFloat(room?.width || 0)}
        roomDepth={parseFloat(room?.depth || 0)}
        roomHeight={parseFloat(room?.height || 0)}
      />

      {/* Placements grouped into stacks */}
      {groupedStacks.length > 0 ? (
        groupedStacks.map(([key, stackPlacements], index) => {
          const firstPlacement = stackPlacements[0];
          return (
            <ItemStack
              key={key}
              placements={stackPlacements}
              roomHeight={parseFloat(room?.height || 0)}
              productId={firstPlacement.product_id}
            />
          );
        })
      ) : null}

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

// Loading fallback component
const CanvasLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-sm">Loading 3D visualization...</p>
    </div>
  </div>
);

// Error Boundary Component
const ErrorFallback = ({ error }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
    <div className="text-center p-4">
      <p className="text-red-600 dark:text-red-400 font-semibold mb-2">3D Visualization Error</p>
      <p className="text-sm text-red-500 dark:text-red-500">{error?.message || 'Unknown error'}</p>
      <p className="text-xs text-red-400 dark:text-red-600 mt-2">Check browser console for details</p>
    </div>
  </div>
);

const Room3DView = ({ room, placements = [], door = null }) => {
  // Use door prop if provided, otherwise use room.door
  const doorData = door || room?.door;
  
  // Debug logging
  useEffect(() => {
    console.log('Room3DView - room:', room);
    console.log('Room3DView - door prop:', door);
    console.log('Room3DView - room.door:', room?.door);
    console.log('Room3DView - final doorData:', doorData);
  }, [room, door, doorData]);
  const { isDark } = useTheme();
  const [error, setError] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Room3DView rendered:', {
      hasRoom: !!room,
      placementsCount: placements?.length || 0,
      roomDimensions: room ? {
        width: room.width,
        depth: room.depth,
        height: room.height
      } : null
    });
  }, [room, placements]);

  if (!room) {
    return (
      <div className="w-full glass rounded-lg p-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">Room data not available</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">Please select a valid room</p>
      </div>
    );
  }

  // Allow rendering even without placements to show room structure

  // Validate room dimensions
  const roomWidth = parseFloat(room.width || 0);
  const roomDepth = parseFloat(room.depth || 0);
  const roomHeight = parseFloat(room.height || 0);

  if (roomWidth <= 0 || roomDepth <= 0 || roomHeight <= 0) {
    return (
      <div className="w-full glass rounded-lg p-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">Invalid room dimensions</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Room dimensions must be greater than 0. Current: {roomWidth} × {roomDepth} × {roomHeight} cm
        </p>
      </div>
    );
  }

  // Filter out invalid placements
  const validPlacements = useMemo(() => {
    if (!placements || placements.length === 0) return [];
    return placements.filter(p => {
      const x = parseFloat(p.x_position || 0);
      const y = parseFloat(p.y_position || 0);
      const z = parseFloat(p.z_position || 0);
      const w = parseFloat(p.width || 0);
      const d = parseFloat(p.depth || 0);
      const h = parseFloat(p.height || 0);
      return !isNaN(x) && !isNaN(y) && !isNaN(z) && 
             !isNaN(w) && w > 0 && 
             !isNaN(d) && d > 0 && 
             !isNaN(h) && h > 0;
    });
  }, [placements]);

  return (
    <div className="w-full glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">3D Visualization</h3>
        <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Room: {roomWidth.toFixed(0)} × {roomDepth.toFixed(0)} × {roomHeight.toFixed(0)} cm
          {validPlacements.length > 0 && ` | Items: ${validPlacements.length}`}
        </div>
      </div>
      
      <div 
        className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-lg overflow-hidden shadow-depth-lg" 
        style={{ 
          height: '600px', 
          minHeight: '400px', 
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        {error && <ErrorFallback error={error} />}
        {!error && (
          <Suspense fallback={<CanvasLoader />}>
            <Canvas 
              shadows 
              gl={{ 
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: true,
                stencil: false,
                depth: true,
                logarithmicDepthBuffer: true
              }}
              camera={{ fov: 55, near: 0.1, far: 1000 }}
              dpr={[1, 2]}
              style={{ 
                width: '100%', 
                height: '100%', 
                display: 'block',
                position: 'relative',
                zIndex: 1
              }}
              frameloop="always"
              onCreated={(state) => {
                try {
                  // Ensure canvas is properly initialized
                  console.log('✅ Canvas created successfully', {
                    gl: !!state.gl,
                    scene: !!state.scene,
                    camera: !!state.camera,
                    size: state.size,
                    viewport: state.viewport
                  });
                  
                  if (!state.gl) {
                    throw new Error('WebGL context not available');
                  }
                  
                  state.gl.setClearColor('#111827', 1);
                  if (state.size) {
                    state.gl.setSize(state.size.width, state.size.height);
                  }
                  setCanvasReady(true);
                  setError(null);
                } catch (err) {
                  console.error('❌ Error in onCreated:', err);
                  setError(err);
                }
              }}
              onError={(error) => {
                console.error('❌ Canvas error:', error);
                setError(error);
              }}
            >
              <color attach="background" args={['#111827']} />
              <fog attach="fog" args={['#111827', 10, 50]} />
              <Scene 
                key={`scene-${doorData?.x || 'no-door'}-${doorData?.y || 'no-door'}-${doorData?.width || 'no-door'}-${doorData?.height || 'no-door'}-${doorData?.wall || 'north'}`}
                room={room} 
                placements={validPlacements} 
                door={doorData || null} 
              />
            </Canvas>
          </Suspense>
        )}
      </div>

      {/* Enhanced Controls hint */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-2">
          <p className="font-semibold">🖱️ <strong>Left click + drag</strong> to rotate | <strong>Scroll</strong> to zoom | <strong>Right click + drag</strong> to pan</p>
        </div>
        <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          💡 Zoom in close to see product labels and layer indicators clearly
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg">
          <div className="w-4 h-4 bg-gradient-primary rounded border border-neutral-300 dark:border-neutral-600 shadow-sm"></div>
          <span className="text-neutral-600 dark:text-neutral-400 font-semibold">Product Stacks (Layers)</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-success-50/50 to-primary-50/50 dark:from-success-900/20 dark:to-primary-900/20 rounded-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-500 font-medium">
            Each box represents a product item - stacked items show layers
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room3DView;
