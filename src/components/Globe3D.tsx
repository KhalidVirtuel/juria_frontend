import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Globe3DProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GlobeSegment: React.FC<{
  position: [number, number, number];
  color: string;
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ position, color, id, title, isActive, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isActive) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isActive ? 0.9 : hovered ? 0.7 : 0.5}
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {/* Text Label */}
      <Text
        position={[0, 0, 1]}
        fontSize={0.2}
        color={isActive ? '#ffffff' : '#333333'}
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
    </group>
  );
};

const MainGlobe: React.FC<Globe3DProps> = ({ activeTab, setActiveTab }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const segments = [
    {
      id: 'assistant',
      title: 'Répondre',
      color: '#3b82f6',
      position: [0, 1, 0] as [number, number, number]
    },
    {
      id: 'redaction',
      title: 'Rédiger',
      color: '#10b981',
      position: [1, 0, 0] as [number, number, number]
    },
    {
      id: 'analyse',
      title: 'Analyser',
      color: '#8b5cf6',
      position: [0, -1, 0] as [number, number, number]
    },
    {
      id: 'recherche',
      title: 'Organiser',
      color: '#f59e0b',
      position: [-1, 0, 0] as [number, number, number]
    }
  ];

  return (
    <group ref={groupRef}>
      {/* Central Core */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#1f2937"
          emissive="#374151"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Globe Segments */}
      {segments.map((segment) => (
        <GlobeSegment
          key={segment.id}
          position={segment.position}
          color={segment.color}
          id={segment.id}
          title={segment.title}
          isActive={activeTab === segment.id}
          onClick={() => setActiveTab(segment.id)}
        />
      ))}
    </group>
  );
};

const Globe3D: React.FC<Globe3DProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full h-96 relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <MainGlobe activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
      
      {/* Overlay Information */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center bg-background/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
          <h3 className="text-xl font-bold mb-2">
            {activeTab === 'assistant' && 'Répondre'}
            {activeTab === 'redaction' && 'Rédiger'}
            {activeTab === 'analyse' && 'Analyser'}
            {activeTab === 'recherche' && 'Organiser'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'assistant' && 'Posez-moi une question, j\'y réponds. À tout moment, 24/7.'}
            {activeTab === 'redaction' && 'Un contrat, une requête, un acte… Je génère vos brouillons en minutes.'}
            {activeTab === 'analyse' && 'Vous m\'apportez un dossier, je le décortique et analyse.'}
            {activeTab === 'recherche' && 'Clients, dossiers, audiences : tout est centralisé.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Globe3D;