
import React, { useState, useEffect } from 'react';
import { X, Scale, ExternalLink, ShieldCheck, TrendingDown, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';

interface ComparisonModalProps {
  product: Product;
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ product, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ text: string, links: any[] } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await geminiService.compareProducts(product.name, product.category);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [product]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FBFBF9] w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors z-10">
          <X size={24} />
        </button>

        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="p-10 pb-6 bg-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Scale size={14} /> Market Comparison
            </div>
            <h3 className="text-3xl font-serif">Price & Quality Benchmark</h3>
            <p className="text-black/40 text-sm mt-2">Real-time analysis comparing PlanPro's {product.name} with luxury alternatives.</p>
          </div>

          <div className="p-10 space-y-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-black/20" size={40} />
                <p className="text-sm font-medium text-black/40">Gathering market data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-green-50 border border-green-100 rounded-3xl space-y-2">
                    <ShieldCheck className="text-green-600" size={24} />
                    <h4 className="font-bold text-green-900">PlanPro Edge</h4>
                    <p className="text-sm text-green-700/80">Premium materials (Grade A) and integrated AR tools included at no extra cost.</p>
                  </div>
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
                    <TrendingDown className="text-blue-600" size={24} />
                    <h4 className="font-bold text-blue-900">Value Efficiency</h4>
                    <p className="text-sm text-blue-700/80">Our direct-to-consumer model saves you 20-30% compared to typical showroom retail.</p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-black/70 leading-relaxed whitespace-pre-wrap">
                  {data?.text}
                </div>

                <div className="space-y-4 pt-6 border-t border-black/5">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Data Sources & Citations</h5>
                  <div className="flex flex-wrap gap-2">
                    {data?.links.map((chunk: any, i: number) => (
                      chunk.web && (
                        <a 
                          key={i} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/5 rounded-full text-xs font-medium hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                          {chunk.web.title} <ExternalLink size={12} />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
