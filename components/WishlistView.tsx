import React from 'react';
import { Heart, ArrowRight, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ProductCard from './ProductCard';

interface WishlistViewProps {
    wishlist: string[];
    onToggleWishlist: (id: string) => void;
    onAddToCart: (id: string) => void;
    onViewDetails: (p: Product) => void;
    onAR: (p: Product) => void;
    onAI: (p: Product) => void;
    onCompare: (p: Product) => void;
    onContinueShopping: () => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({
    wishlist, onToggleWishlist, onAddToCart, onViewDetails, onAR, onAI, onCompare, onContinueShopping
}) => {
    const wishlistedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-8">
                <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center animate-pulse">
                    <Heart size={40} className="text-black/20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Your wishlist is empty</h2>
                    <p className="text-black/40 text-sm max-w-xs mx-auto">Save items you love to your wishlist to keep track of them.</p>
                </div>
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                    Explore Collection <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">
            <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tighter uppercase">Your Wishlist</h2>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Saved Items for later</p>
                </div>
                <span className="text-xs font-bold text-black/40 uppercase tracking-widest">{wishlist.length} Items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {wishlistedProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={true}
                                onToggleWishlist={onToggleWishlist}
                                onAddToCart={onAddToCart}
                                onViewDetails={onViewDetails}
                                onAR={onAR}
                                onAI={onAI}
                                onCompare={onCompare}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex justify-center pt-12">
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-4 border border-black/5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-black transition-all flex items-center gap-2"
                >
                    Continue Shopping <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default WishlistView;
