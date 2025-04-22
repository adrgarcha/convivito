'use client'

import { useMobile } from '@/hooks/use-mobile';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import { Group, Mesh } from 'three';

function HouseModel({ groupRef }: { groupRef: React.Ref<Group> }) {
  const { nodes } = useGLTF('/house.glb')

  return (
    <group ref={groupRef} dispose={null} rotation={[0.3, Math.PI / 1.6, 0]} scale={2.5}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.geometry_0 as Mesh).geometry}
        material={(nodes.geometry_0 as Mesh).material}
      />
    </group>
  )
}

useGLTF.preload('/house.glb');

function SceneContent() {
  const [isInteracting, setIsInteracting] = useState(false);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (!isInteracting) {
      const t = state.clock.getElapsedTime()
      groupRef.current.rotation.set(Math.cos(t / 4) / 8, Math.sin(t / 3) / 4, 0.15 + Math.sin(t / 2) / 8)
      groupRef.current.position.y = (0.5 + Math.cos(t / 2)) / 7
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} color="#fff7ed" />
      <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[0, 5, 0]} castShadow />
      <ContactShadows resolution={512} position={[0, -1.8, 0]} opacity={1} scale={10} blur={3} far={1.8} />
      <Suspense fallback={null}>
        <HouseModel groupRef={groupRef} />
      </Suspense>
      <OrbitControls
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
        enableZoom={false}
      />
      <Environment preset='sunset' blur={0.8} />
    </>
  );
}

export default function House() {
  const { isMobile } = useMobile();

  return (
    <Canvas shadows camera={{ position: [15, 2, -14], fov: isMobile ? 12 : 15 }}>
      <SceneContent />
    </Canvas>
  )
}
