import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, ARButton, Controllers } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, position }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} scale={1} />;
}

function Placement({ models }) {
  const [placed, setPlaced] = useState([]);

  const handlePlace = () => {
    const pos = new THREE.Vector3(0, 0, -1);

    const model = models[placed.length % models.length];

    setPlaced(prev => [...prev, { url: model, position: pos }]);
  };

  return (
    <>
      <mesh onClick={handlePlace}>
        <boxGeometry args={[0.1,0.1,0.1]} />
        <meshBasicMaterial color="red"/>
      </mesh>

      {placed.map((obj,i)=>(
        <Model key={i} url={obj.url} position={obj.position}/>
      ))}
    </>
  );
}

export default function MultiARScene({ models }) {

  if (!(navigator && "xr" in navigator)) {
    return <div>Open this on a mobile device with WebXR support.</div>;
  }

  return (
    <>
      <ARButton />

      <Canvas>
        <XR>
          <ambientLight intensity={1} />
          <Controllers />

          <Suspense fallback={null}>
            <Placement models={models}/>
          </Suspense>

        </XR>
      </Canvas>
    </>
  );
}