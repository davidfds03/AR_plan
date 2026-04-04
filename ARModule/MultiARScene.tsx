import React, { useState, Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { XR, ARButton, createXRStore, useXR } from "@react-three/xr";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";


function Model({ url, position, index, draggable, onPointerDown, onPointerMove, onPointerUp, onLoadSize }: { url: string; position: THREE.Vector3; index?: number; draggable?: boolean; onPointerDown?: (e: any, i?: number)=>void; onPointerMove?: (e: any, i?: number)=>void; onPointerUp?: (e: any, i?: number)=>void; onLoadSize?: (i:number, size:THREE.Vector3)=>void }) {
  const ref = React.useRef<THREE.Group | null>(null);
  const reportedRef = React.useRef(false);

  // defensive read of the glTF result
  const gltf: any = useGLTF(url);
  const scene = gltf?.scene ?? (Array.isArray(gltf) ? gltf[0]?.scene : undefined);

  if (!scene) return null;

  // Ensure the loaded scene's internal position is reset so the wrapper group's position controls placement
  scene.position.set(0, 0, 0);

  // compute bounding box and report size once
  React.useEffect(() => {
    if (reportedRef.current) return;
    try {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (onLoadSize && typeof index === 'number') {
        onLoadSize(index, size);
        reportedRef.current = true;
      }
    } catch (err) {
      // ignore errors measuring
    }
  }, [scene, index, onLoadSize]);

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        // Attempt to capture pointer so move events continue
        try { (e.target as any)?.setPointerCapture?.(e.pointerId); } catch {}
        onPointerDown?.(e, index);
      }}
      onPointerMove={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        onPointerMove?.(e, index);
      }}
      onPointerUp={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        try { (e.target as any)?.releasePointerCapture?.(e.pointerId); } catch {}
        onPointerUp?.(e, index);
      }}
    >
      <primitive object={scene} scale={0.8} />
    </group>
  );
}

function Scene({ models, placed, selectedIndex, onDragStart, onDragMove, onDragEnd, onLoadSize, onPlaceAt }: { models: string[]; placed: { url: string; position: THREE.Vector3 }[]; selectedIndex: number; onDragStart: (i:number, e:any)=>void; onDragMove: (i:number, e:any)=>void; onDragEnd: (i:number, e:any)=>void; onLoadSize: (i:number, size:THREE.Vector3)=>void; onPlaceAt: (pos:THREE.Vector3)=>void }) {
  const preview = placed.length === 0 && models && models.length > 0;
  const { gl } = useThree();
  const { session, isPresenting } = useXR();

  // Setup hit-test based dragging when an XR session is active
  React.useEffect(() => {
    if (!gl || !gl.xr) return;
    const xrSession = gl.xr.getSession();
    if (!xrSession) return;

    let hitTestSource: any = null;
    let refSpace: any = null;
    let viewerSpace: any = null;

    let mounted = true;

    Promise.all([
      xrSession.requestReferenceSpace('viewer').then((s:any) => { viewerSpace = s; return viewerSpace; }),
      xrSession.requestReferenceSpace('local').then((s:any) => { refSpace = s; return refSpace; })
    ]).then(() => {
      if (!mounted) return;
      if (viewerSpace) {
        xrSession.requestHitTestSource({ space: viewerSpace }).then((src:any) => { hitTestSource = src; }).catch(() => {});
      }
    }).catch(() => {});

    const onSelectStart = (ev: any) => {
      try {
        const frame = ev.frame as XRFrame;
        if (!frame || !hitTestSource || !refSpace) return;
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length > 0) {
          const pose = results[0].getPose(refSpace);
          if (pose) {
            const pos = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            // choose nearest placed object
            let minDist = Infinity; let nearest = -1;
            placed.forEach((p, idx) => {
              const d = p.position.distanceTo(pos);
              if (d < minDist) { minDist = d; nearest = idx; }
            });
            const selectionThreshold = 0.8; // meters
            if (nearest !== -1 && minDist < selectionThreshold) {
              // start dragging the nearest object
              onDragStart(nearest, { point: pos });
            } else {
              // not near an existing object => place selected model at hit position
              onPlaceAt(pos);
            }
          }
        }
      } catch (err) {
        // ignore
      }
    };

    xrSession.addEventListener('selectstart', onSelectStart);
    const onSelectEnd = (ev: any) => {
      try {
        // simply end any drag in parent by calling onDragEnd with nearest index
        const frame = ev.frame as XRFrame;
        if (!frame || !hitTestSource || !refSpace) return;
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length > 0) {
          const pose = results[0].getPose(refSpace);
          if (pose) {
            const pos = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            let minDist = Infinity; let nearest = -1;
            placed.forEach((p, idx) => {
              const d = p.position.distanceTo(pos);
              if (d < minDist) { minDist = d; nearest = idx; }
            });
            if (nearest !== -1) onDragEnd(nearest, {});
          }
        }
      } catch (err) {}
    };
    xrSession.addEventListener('selectend', onSelectEnd);

    let rafHandle: any = null;
    const onXRFrame = (time: any, xrFrame: XRFrame) => {
      try {
        // if any object is being dragged, update its position from hit test
        // find dragging index by comparing last known placed positions (we use parent state via closure)
        // We will search for an object where onDragStart was called earlier by parent stored draggingIndex; parent maintains draggingIndex state
        // Instead of reading parent's draggingIndex directly, call get placed and compute if any object was marked as moving by proximity.
        // Simpler: always perform hit test and if a dragging index exists in parent (we detect via placed array changes), parent has set draggingIndex via onDragStart
        // We'll rely on onDragStart having been called to set draggingIndex in parent; here we'll call hitTest and if parent has an active drag (we detect via comparing previous placed vs current?), to keep code simple we'll always update all placed positions for which distance to hit point is < 2 and let parent handle index match.
        if (!xrFrame || !hitTestSource || !refSpace) {
          xrSession.requestAnimationFrame(onXRFrame);
          return;
        }

        const results = xrFrame.getHitTestResults(hitTestSource);
        if (results.length > 0) {
          const pose = results[0].getPose(refSpace);
          if (pose) {
            const pos = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            // call onDragMove for any placed object that is currently closest to the camera pointer
            // find nearest placed object to this hit point within threshold and call onDragMove
            let minDist = Infinity; let nearest = -1;
            placed.forEach((p, idx) => {
              const d = p.position.distanceTo(pos);
              if (d < minDist) { minDist = d; nearest = idx; }
            });
            if (nearest !== -1 && minDist < 2.0) {
              onDragMove(nearest, { point: pos });
            }
          }
        }
      } catch (err) {
        // ignore per-frame errors
      }
      rafHandle = xrSession.requestAnimationFrame(onXRFrame);
    };

    rafHandle = xrSession.requestAnimationFrame(onXRFrame);

    return () => {
      mounted = false;
      try { xrSession.removeEventListener('selectstart', onSelectStart); } catch {}
      try { xrSession.removeEventListener('selectend', onSelectEnd); } catch {}
      try { if (hitTestSource) hitTestSource.cancel(); } catch {}
      try { if (rafHandle) xrSession.cancelAnimationFrame?.(rafHandle); } catch {}
    };
  }, [gl, placed, onDragStart, onDragMove, onPlaceAt]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />

      {preview && (
        // If multiple models are available, show a side-by-side preview
        models.length > 1 ? (
          models.map((m, i) => {
            const center = (models.length - 1) / 2;
            const spacing = 0.6;
            const x = (i - center) * spacing;
            return <Model key={m} url={m} index={i} onLoadSize={onLoadSize} position={new THREE.Vector3(x, 0, 0)} />;
          })
        ) : (
          <Model url={models[selectedIndex]} index={selectedIndex} onLoadSize={onLoadSize} position={new THREE.Vector3(0, 0, 0)} />
        )
      )}

      {placed.map((obj, i) => {
        const modelIndex = models.indexOf(obj.url);
        return (
          <Model key={i} url={obj.url} position={obj.position} index={modelIndex >= 0 ? modelIndex : undefined} draggable={true} onLoadSize={onLoadSize} onPointerDown={(e:any, idx?:number)=>onDragStart(i, e)} onPointerMove={(e:any, idx?:number)=>onDragMove(i, e)} onPointerUp={(e:any, idx?:number)=>onDragEnd(i, e)} />
        );
      })}
    </>
  );
}

export default function MultiARScene({ models }: { models: string[] }) {

  // debug log for incoming models
  // eslint-disable-next-line no-console
  console.log("MultiARScene models:", models);

  const [placed, setPlaced] = useState<{ url: string; position: THREE.Vector3 }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [sizes, setSizes] = useState<(THREE.Vector3 | null)[]>(() => models.map(() => null));

  const [xrPresent, setXrPresent] = useState<boolean | null>(null);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [secureContext, setSecureContext] = useState<boolean>(false);

  // create a single XR store instance and pass it to XR and ARButton
  const store = createXRStore();

  const tryEnterAR = async () => {
    // eslint-disable-next-line no-console
    console.log('Attempting to enter AR via store or navigator.xr');
    try {
      if ((store as any)?.enterAR) {
        (store as any).enterAR();
        return;
      }

      const xr = (navigator as any).xr;
      if (xr && xr.requestSession) {
        const session = await xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor', 'hit-test'] });
        // eslint-disable-next-line no-console
        console.log('XR session created:', session);
      } else {
        // eslint-disable-next-line no-console
        console.warn('No enterAR available and navigator.xr.requestSession not present');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error entering AR:', err);
    }
  };

  // reset sizes when models list changes
  useEffect(() => {
    setSizes(models.map(() => null));
  }, [models]);

  const onLoadSize = (index: number, size: THREE.Vector3) => {
    setSizes(prev => {
      const copy = prev.slice();
      copy[index] = size;
      return copy;
    });
  };

  const handlePlaceAt = (pos: THREE.Vector3) => {
    const model = models[selectedIndex];
    setPlaced(prev => [...prev, { url: model, position: pos.clone() }]);
  };

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

  // If navigator.xr is not present, tell the user to open on a WebXR-capable device.
  if (xrPresent === false) {
    return <div>Open this on a mobile device with WebXR support.</div>;
  }

  // If we determined that immersive-ar is not supported, show a clear message.
  if (xrSupported === false) {
    return (
      <div>
        WebXR 'immersive-ar' not supported on this device/browser.
        {secureContext === false && (
          <div>This page must be served over HTTPS (secure context) for WebXR.</div>
        )}
      </div>
    );
  }

  // If the runtime indicates AR is supported but the page is not secure,
  // explain why the AR button is hidden (browsers require secure context).
  if (xrSupported === true && secureContext === false) {
    return (
      <div>
        Your device/browser supports WebXR 'immersive-ar', but this page is not served
        over HTTPS. Serve the site over HTTPS (or use localhost/ngrok) to enable the
        Enter AR button.
      </div>
    );
  }

  const handlePlace = () => {
    const margin = 0.08;
    const defaultWidth = 1.0;

    const getWidthForUrl = (url: string) => {
      const idx = models.indexOf(url);
      if (idx === -1) return defaultWidth;
      const s = sizes[idx];
      return s ? Math.max(0.1, s.x) : defaultWidth;
    };

    const model = models[selectedIndex];

    // find right-most edge among placed objects
    let maxRight = -Infinity;
    for (const p of placed) {
      const w = getWidthForUrl(p.url);
      const right = p.position.x + w / 2;
      if (right > maxRight) maxRight = right;
    }

    const newWidth = getWidthForUrl(model);
    const x = (maxRight === -Infinity) ? 0 : (maxRight + newWidth / 2 + margin);
    const pos = new THREE.Vector3(x, 0, -1.5);

    setPlaced((prev) => [...prev, { url: model, position: pos }]);
  };

  const handlePlaceAll = () => {
    if (!models || models.length === 0) return;
    const margin = 0.08;
    const defaultWidth = 1.0;

    const getWidthForIndex = (i: number) => {
      const s = sizes[i];
      return s ? Math.max(0.1, s.x) : defaultWidth;
    };

    const widths = models.map((m, i) => getWidthForIndex(i));
    const total = widths.reduce((a, b) => a + b, 0) + margin * (models.length - 1);
    let x = -total / 2 + widths[0] / 2;
    const z = -1.5;

    const all = models.map((m, i) => {
      const pos = new THREE.Vector3(x, 0, z);
      x += widths[i] + margin;
      return { url: m, position: pos };
    });

    setPlaced((prev) => [...prev, ...all]);
  };

  // Drag handlers
  const onDragStart = (i: number, e: any) => {
    setDraggingIndex(i);
  };

  const onDragMove = (i: number, e: any) => {
    if (draggingIndex !== i) return;
    // Use ray-plane intersection to get a stable ground position
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    if (e.ray) {
      e.ray.intersectPlane(plane, point);
      if (point) {
        setPlaced(prev => prev.map((p, idx) => idx === i ? { ...p, position: point.clone() } : p));
      }
    }
  };

  const onDragEnd = (i: number, e: any) => {
    setDraggingIndex(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* DOM PLACE BUTTON (outside Canvas) */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 3000, display: 'flex', gap: 8 }}>
        <button
          onClick={handlePlace}
        style={{
          padding: "12px 16px",
          background: "black",
          color: "white",
          borderRadius: "8px",
          pointerEvents: "auto",
          cursor: 'pointer'
        }}
      >
        Place Object
      </button>

      <button
        onClick={handlePlaceAll}
        style={{
          padding: '12px 16px',
          background: '#0b74de',
          color: 'white',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Place All
      </button>
      </div>

      {/* AR BUTTON */}
      {xrSupported && secureContext && (
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 3000, pointerEvents: "auto" }}>
          <ARButton store={store} />
        </div>
      )}

      {/* Bottom 'View in your room' bar to match single-model UI */}
      {xrSupported && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            background: "#f0f0f0",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 3000,
            pointerEvents: "auto"
          }}
        >
          <div style={{ fontSize: 18 }}>View in your room</div>
          <div>
            {secureContext ? (
              <>
                <ARButton store={store} />
                <button
                  onClick={tryEnterAR}
                  style={{ marginLeft: 8, padding: '8px 12px' }}
                >
                  Enter AR
                </button>
              </>
            ) : (
              <div style={{ color: "#666" }}>Enable HTTPS to enter AR</div>
            )}
          </div>
        </div>
      )}

      {/* Model selection strip (above bottom bar) */}
      {models && models.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 72, zIndex: 3000, pointerEvents: 'auto', padding: '8px 12px' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {models.map((m, i) => {
              const name = m.split('/').pop() || `Item ${i + 1}`;
              const active = i === selectedIndex;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedIndex(i)}
                  style={{
                    minWidth: 96,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#111',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }} style={{ touchAction: 'none' }}>
        <XR store={store}>
              <Suspense fallback={null}>
                <Scene models={models} placed={placed} selectedIndex={selectedIndex} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onLoadSize={onLoadSize} onPlaceAt={handlePlaceAt} />
              </Suspense>
          </XR>
          <OrbitControls enableRotate={draggingIndex === null} enablePan={draggingIndex === null} enableZoom={draggingIndex === null} />
      </Canvas>
    </div>
  );
}