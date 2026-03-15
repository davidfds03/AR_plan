import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, ARButton } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, position }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} scale={1} />;
}

function Placement({ models, placed }: { models: string[]; placed: any[] }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {placed.map((obj: any, i: number) => (
        <Model key={i} url={obj.url} position={obj.position} />
      ))}
    </>
  );
}

export default function MultiARScene({ models }: { models: string[] }) {

  const [placed, setPlaced] = useState<any[]>([]);

  // debug log for incoming models
  // eslint-disable-next-line no-console
  console.log("MultiARScene models:", models);

  const [xrPresent, setXrPresent] = useState<boolean | null>(null);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [secureContext, setSecureContext] = useState<boolean>(false);

  useEffect(() => {
    const hasXr = typeof navigator !== "undefined" && "xr" in navigator;
    setXrPresent(hasXr);
    setSecureContext(typeof window !== "undefined" && !!window.isSecureContext);

    if (hasXr && (navigator as any).xr && (navigator as any).xr.isSessionSupported) {
      (navigator as any).xr.isSessionSupported("immersive-ar").then((supported: boolean) => {
        setXrSupported(supported);
        // eslint-disable-next-line no-console
        console.log("navigator.xr.isSessionSupported('immersive-ar') ->", supported);
      }).catch((err: any) => {
        // eslint-disable-next-line no-console
        console.warn("isSessionSupported error:", err);
        setXrSupported(false);
      });
    } else {
      setXrSupported(false);
    }
  }, []);

  if (!(navigator && "xr" in navigator)) {
    return <div>Open this on a mobile device with WebXR support.</div>;
  }

  const handlePlace = () => {
    const pos = new THREE.Vector3(0, 0, -1);

    const model = models[placed.length % models.length];

    setPlaced((prev) => [...prev, { url: model, position: pos }]);
  };

  return (
    <>
      <ARButton />

      <button
        style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}
        onClick={handlePlace}
      >
        Place Object
      </button>

      <Canvas>
        <XR>
          <ambientLight intensity={1} />

          <Suspense fallback={null}>
            <Placement models={models} placed={placed} />
          </Suspense>

        </XR>
      </Canvas>
    </>
  );
}