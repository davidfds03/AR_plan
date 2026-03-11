
import React, { useState, useRef, useEffect } from 'react';
import {
  X, QrCode, Smartphone, Scan, Camera, Layers, Plus,
  RotateCw, Maximize2, Trash2, Check, Sparkles, Download,
  ChevronLeft, Layout, Loader2, Cpu, Info, MousePointer2
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ARScene3D from './ARScene3D';
import Scene3D from './Scene3D';

interface PlacedItem {
  instanceId: string;
  product: Product;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ARPreviewModalProps {
  product: Product;
  onClose: () => void;
  initialViewMode?: 'qr' | 'live';
}

const ARPreviewModal: React.FC<ARPreviewModalProps> = ({ product, onClose, initialViewMode = 'qr' }) => {
  const [viewMode, setViewMode] = useState<'qr' | 'live'>(initialViewMode);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([
    { instanceId: 'init', product, x: 50, y: 50, scale: 1, rotation: 0 }
  ]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>('init');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showStudioOnMobile, setShowStudioOnMobile] = useState(false);

  const qrUrl = `${window.location.origin}?target=ar&id=${product.id}&view=live`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'live' && !isCameraActive) {
      startCamera();
    }
    return () => {
      if (viewMode !== 'live') stopCamera();
    };
  }, [viewMode]);

  const startCamera = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setViewMode('qr');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const addItemToStage = (p: Product) => {
    const newItem: PlacedItem = {
      instanceId: Math.random().toString(36).substr(2, 9),
      product: p,
      x: 40 + (placedItems.length * 2),
      y: 40 + (placedItems.length * 2),
      scale: 0.8,
      rotation: 0
    };
    setPlacedItems([...placedItems, newItem]);
    setSelectedInstanceId(newItem.instanceId);
  };

  const updateItem = (id: string, updates: Partial<PlacedItem>) => {
    setPlacedItems(items => items.map(item =>
      item.instanceId === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setPlacedItems(items => items.filter(i => i.instanceId !== id));
    if (selectedInstanceId === id) setSelectedInstanceId(null);
  };

  const selectedItem = placedItems.find(i => i.instanceId === selectedInstanceId);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

      <div className="relative w-full h-full max-w-6xl max-h-[850px] bg-white rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">

        {/* Left Panel: Viewport / Visuals */}
        <div className="flex-1 bg-[#F5F5F3] relative overflow-hidden group">
          {viewMode === 'qr' ? (
            <div className="w-full h-full relative group">
              <Scene3D modelUrl={product.model} />

              {/* Interaction Guide */}
              <div className="absolute bottom-10 left-10 z-10 space-y-2 pointer-events-none group-hover:opacity-0 transition-all duration-700">
                <div className="flex items-center gap-4 py-2 px-5 bg-white/50 backdrop-blur-md rounded-full border border-black/5">
                  <MousePointer2 size={14} className="text-black/40" strokeWidth={3} />
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Orbit & Zoom Active</span>
                </div>
              </div>

              {/* Scanline decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent animate-[scan_4s_linear_infinite] pointer-events-none" />
            </div>
          ) : (
            /* Live Camera View */
            <div className="absolute inset-0 w-full h-full" ref={stageRef}>
              {!isCameraActive && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-[#F5F5F3]">
                  <Loader2 className="animate-spin text-black/10 mb-4" size={40} />
                  <p className="text-[10px] font-black tracking-widest text-black/30 uppercase">Initializing Lenses...</p>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-opacity duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} />

              {isCameraActive && (
                <div className="absolute inset-0 z-10">
                  {placedItems.map((item) => (
                    <div
                      key={item.instanceId}
                      onMouseDown={() => setSelectedInstanceId(item.instanceId)}
                      className={`absolute group cursor-move ${selectedInstanceId === item.instanceId ? 'z-50' : 'z-20'}`}
                      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})` }}
                    >
                      <div className="relative">
                        {selectedInstanceId === item.instanceId && (
                          <div className="absolute -inset-4 border border-black/20 rounded-3xl animate-pulse pointer-events-none" />
                        )}
                        <ARScene3D
                          product={item.product}
                          rotation={item.rotation}
                          scale={item.scale}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[150] pointer-events-none">
            <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-black/5 pointer-events-auto shadow-sm">
              <button onClick={() => setViewMode('qr')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'qr' ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black'}`}>Sync</button>
              <button onClick={() => setViewMode('live')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black'}`}>Live</button>
            </div>

            {/* Mobile Studio Toggle */}
            <button
              onClick={() => setShowStudioOnMobile(!showStudioOnMobile)}
              className="md:hidden p-3 rounded-full bg-black text-white pointer-events-auto shadow-xl flex items-center gap-2"
            >
              {showStudioOnMobile ? <X size={18} /> : <Plus size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-widest pr-1">
                {showStudioOnMobile ? "Close" : "Items"}
              </span>
            </button>

            {viewMode === 'live' && isCameraActive && (
              <button className="p-3 rounded-full bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white transition-all pointer-events-auto shadow-xl">
                <Download size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Studio Controls */}
        <div className={`w-full md:w-[400px] md:flex flex-col bg-white z-[200] border-l border-black/5 absolute inset-y-0 right-0 md:relative transition-transform duration-500 ease-in-out ${showStudioOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>

          {/* Fixed Header */}
          <div className="p-10 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-3xl font-serif">Spatial Studio</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">LENS ENGINE V2.4</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-black/5 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-12">
            {viewMode === 'qr' ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">

                {/* Integrated Instructions */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Sync Status</h4>
                  <div className="p-8 bg-black/5 rounded-[32px] border border-black/5 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Smartphone size={32} className="mx-auto text-black/20 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Switch to LIVE mode to scan QR</p>
                    </div>
                  </div>
                </div>

                {/* Integrated Instructions - Replacing separate images */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Instructions</h4>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 group-hover:scale-110 transition-transform">1</div>
                      <div className="pt-1.5">
                        <p className="text-xs font-bold text-black/80 uppercase tracking-tight">Camera Launch</p>
                        <p className="text-[11px] text-black/40 font-medium leading-relaxed mt-1">Open your smartphone camera or a QR scanner app.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 group-hover:scale-110 transition-transform">2</div>
                      <div className="pt-1.5">
                        <p className="text-xs font-bold text-black/80 uppercase tracking-tight">Focus & Detect</p>
                        <p className="text-[11px] text-black/40 font-medium leading-relaxed mt-1">Point the device at the encrypted code until a link appears.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 group-hover:scale-110 transition-transform">3</div>
                      <div className="pt-1.5">
                        <p className="text-xs font-bold text-black/80 uppercase tracking-tight">Sync Lenses</p>
                        <p className="text-[11px] text-black/40 font-medium leading-relaxed mt-1">Tap the prompt to establish a secure spatial handshake.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">

                {/* Bridge Connection Section in Live Mode - Prominent Size */}
                <div className="space-y-4 pb-8 border-b border-black/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Bridge Connection</h4>
                  <div className="p-8 bg-[#F5F5F3] rounded-[40px] border border-black/5 flex flex-col items-center shadow-inner">
                    <div className="bg-white p-5 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/5 group hover:scale-[1.05] transition-transform duration-500">
                      <img
                        src={qrImage}
                        alt="Mobile Sync QR Code"
                        className="w-[160px] h-[160px] rounded-xl"
                      />
                    </div>
                    <div className="mt-6 flex items-center gap-2.5 py-1.5 px-3.5 bg-green-500/10 rounded-full border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Scanning Signal Active</span>
                    </div>
                  </div>
                </div>

                {selectedItem ? (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Active Instance</h4>
                    <div className="p-5 bg-[#F5F5F3] rounded-[32px] flex items-center gap-5 border border-black/5 shadow-inner">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-black/5">
                        <img src={selectedItem.product.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-black tracking-widest text-black/30 truncate">{selectedItem.product.category}</p>
                        <p className="font-bold text-base truncate text-black/80">{selectedItem.product.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => updateItem(selectedInstanceId!, { rotation: selectedItem.rotation + 45 })} className="py-5 bg-white border border-black/5 rounded-[24px] flex flex-col items-center gap-2 hover:border-black hover:shadow-lg transition-all active:scale-95">
                        <RotateCw size={18} className="text-black/60" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">Rotate</span>
                      </button>
                      <button onClick={() => updateItem(selectedInstanceId!, { scale: selectedItem.scale + 0.1 })} className="py-5 bg-white border border-black/5 rounded-[24px] flex flex-col items-center gap-2 hover:border-black hover:shadow-lg transition-all active:scale-95">
                        <Maximize2 size={18} className="text-black/60" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">Scale</span>
                      </button>
                      <button onClick={() => removeItem(selectedInstanceId!)} className="col-span-2 py-4 bg-red-50 text-red-600 rounded-[20px] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <Trash2 size={16} /> Delete Instance
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-black/5 rounded-[48px] text-center space-y-5 bg-[#FBFBF9]">
                    <div className="w-14 h-14 bg-black/[0.02] rounded-[20px] flex items-center justify-center mx-auto text-black/20">
                      <MousePointer2 size={28} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Target Selection</p>
                      <p className="text-[11px] text-black/40 leading-relaxed font-medium">Select an object in the viewport to enable spatial modifications.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-5 pt-8 border-t border-black/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Scene Library</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {PRODUCTS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addItemToStage(p)}
                        className="aspect-square bg-[#F5F5F3] rounded-[18px] overflow-hidden border border-transparent hover:border-black transition-all group shadow-sm"
                      >
                        <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer Area */}
          <div className="p-10 pt-6 border-t border-black/5 space-y-6">
            {viewMode === 'live' ? (
              <button onClick={() => setSelectedInstanceId(null)} className="w-full py-5 bg-black text-white rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-black/80 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-black/20">
                <Check size={20} /> Finalize Scene
              </button>
            ) : (
              <div className="p-6 bg-black/5 rounded-[32px] flex items-start gap-4 border border-black/5">
                <Info size={18} className="text-black/30 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-black/40 leading-relaxed font-bold uppercase tracking-tight">
                  Maintain a distance of 1-2 meters for optimal environment mapping.
                </p>
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5 opacity-20">
              <p className="text-[8px] font-black uppercase tracking-[0.4em]">PlanPro Spatial Engine</p>
              <div className="w-12 h-0.5 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-400px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ARPreviewModal;
