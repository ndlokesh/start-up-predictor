import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const CompetitorNode = ({ position, color, delay }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.position.y += Math.sin(clock.elapsedTime * 2 + delay) * 0.005;
  });
  return (
    <Sphere ref={ref} args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </Sphere>
  );
};

export const NetworkMesh = ({ numCompetitors }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    groupRef.current.rotation.y += 0.002;
  });

  const nodes = useMemo(() => {
    const pts = [];
    const clamp = Math.min(Math.max(numCompetitors, 1), 30);
    for (let i = 0; i < clamp; i++) {
      const angle = (Math.PI * 2 * i) / clamp;
      const radius = 2 + Math.random();
      pts.push({
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius],
        delay: Math.random() * 10
      });
    }
    return pts;
  }, [numCompetitors]);

  return (
    <group ref={groupRef}>
      {/* Central Startup Node */}
      <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1} />
      </Sphere>
      
      {nodes.map((node, idx) => (
        <React.Fragment key={idx}>
          <CompetitorNode position={node.position} color="#ff0044" delay={node.delay} />
          <Line points={[[0, 0, 0], node.position]} color="#ffffff" transparent opacity={0.15} lineWidth={1} />
        </React.Fragment>
      ))}
    </group>
  );
};

export default function ThreeScene({ numCompetitors }) {
  return (
    <div className="w-full h-full min-h-[250px] bg-slate-900 rounded-2xl relative overflow-hidden shadow-inset-neon mt-4 border border-blue-500/20">
      <div className="absolute top-4 left-4 z-10 text-white opacity-90 text-[10px] font-bold font-outfit uppercase tracking-widest flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Competitor Network ({numCompetitors} Nodes)
      </div>
      <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <NetworkMesh numCompetitors={numCompetitors || 1} />
        <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
