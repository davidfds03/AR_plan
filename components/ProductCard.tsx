import React from 'react';
import { Box, Sparkles, Scale, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAR: (p: Product) => void;
  onAI: (p: Product) => void;
  onCompare: (p: Product) => void;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onViewDetails: (p: Product) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, onAR, onAI, onCompare, onAddToCart, onToggleWishlist, onViewDetails, isWishlisted 
}) => {
  return (
    <div className="group relative bg-white rounded-[32px] overflow-hidden border border-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-2">
      <div 
        className="relative aspect-square overflow-hidden bg-[#F5F5F3] cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white hover:scale-110 transition-all active:scale-95 z-10"
        >
          <Heart size={18} className={`${isWishlisted ? "fill-red-500 text-red-500" : "text-black/40"} transition-colors`} />
        </button>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/20 to-transparent flex justify-center gap-3 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onAR(product); }}
            className="p-3 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all shadow-lg active:scale-95 group/btn"
            title="AR Preview"
          >
            <Box size={18} className="group-hover/btn:rotate-12 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAI(product); }}
            className="p-3 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all shadow-lg active:scale-95 group/btn"
            title="AI Room Builder"
          >
            <Sparkles size={18} className="group-hover/btn:scale-125 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onCompare(product); }}
            className="p-3 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all shadow-lg active:scale-95 group/btn"
            title="Compare with Market"
          >
            <Scale size={18} className="group-hover/btn:-rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-2 relative bg-white">
        <div className="flex justify-between items-start cursor-pointer" onClick={() => onViewDetails(product)}>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">{product.category}</span>
            <h4 className="font-serif text-xl mt-1 group-hover:text-black/70 transition-colors">{product.name}</h4>
          </div>
          <span className="text-lg font-medium">${product.price}</span>
        </div>
        
        <p className="text-sm text-black/50 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <button 
          onClick={() => onAddToCart(product.id)}
          className="w-full mt-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black/80 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all group/atc"
        >
          <ShoppingCart size={16} className="group-hover/atc:animate-bounce" /> Add to Collection
        </button>
      </div>
    </div>
  );
};

export default ProductCard;