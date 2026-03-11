import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

interface ModelProps {
    url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
};

interface Scene3DProps {
    modelUrl: string;
}

const Scene3D: React.FC<Scene3DProps> = ({ modelUrl }) => {
    if (!modelUrl) return null;

    return (
        <div className="w-full h-full min-h-[400px] bg-[#F5F5F3] rounded-[32px] overflow-hidden relative group">
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} shadows={false} adjustCamera={2}>
                        <Model url={modelUrl} />
                    </Stage>
                    <OrbitControls
                        makeDefault
                        enableDamping={true}
                        dampingFactor={0.05}
                        minDistance={2}
                        maxDistance={6}
                        enablePan={false}
                    />
                    <Environment preset="city" />
                    <ContactShadows
                        position={[0, -1, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={2}
                    />
                </Suspense>
            </Canvas>

            {/* 3D View Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-3 py-2 px-4 bg-white/50 backdrop-blur-md rounded-full border border-black/5 pointer-events-none group-hover:opacity-0 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">3D Mode Active</span>
            </div>
        </div>
    );
};

export default Scene3D;
