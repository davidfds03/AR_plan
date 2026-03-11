import React from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';

interface CartViewProps {
    cart: { id: string; qty: number }[];
    onUpdateQty: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    onCheckout: () => void;
    onContinueShopping: () => void;
}

const CartView: React.FC<CartViewProps> = ({
    cart, onUpdateQty, onRemove, onCheckout, onContinueShopping
}) => {
    const cartItems = cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        return { ...product, qty: item.qty } as Product & { qty: number };
    });

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + shipping;

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-8">
                <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center animate-pulse">
                    <ShoppingBag size={40} className="text-black/20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Your collection is empty</h2>
                    <p className="text-black/40 text-sm max-w-xs mx-auto">Looks like you haven't added any pieces to your collection yet.</p>
                </div>
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                    Start Exploring <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-black/5 pb-6">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase">Your Collection</h2>
                        <span className="text-xs font-bold text-black/40 uppercase tracking-widest">{cart.length} Items</span>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-[32px] border border-black/5 hover:shadow-xl transition-all group"
                                >
                                    <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-[#F5F5F3]">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>

                                    <div className="flex-1 space-y-1 text-center sm:text-left">
                                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{item.category}</span>
                                        <h4 className="text-xl font-serif">{item.name}</h4>
                                        <p className="text-sm text-black/40 line-clamp-1">{item.dimensions} • {item.material}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                                            <button
                                                onClick={() => onUpdateQty(item.id, -1)}
                                                className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                                                disabled={item.qty <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                                            <button
                                                onClick={() => onUpdateQty(item.id, 1)}
                                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="text-right min-w-[80px]">
                                            <p className="font-bold text-lg">${item.price * item.qty}</p>
                                            <p className="text-[10px] text-black/30 font-bold uppercase tracking-tighter">${item.price} / unit</p>
                                        </div>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-3 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={onContinueShopping}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors group"
                    >
                        <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                    </button>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[40px] p-8 md:p-10 border border-black/5 shadow-2xl sticky top-32 space-y-8">
                        <h3 className="text-2xl font-bold tracking-tighter uppercase">Summary</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-black/40 font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="font-bold">${subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-black/40 font-bold uppercase tracking-widest">Shipping</span>
                                <span className="font-bold">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                            </div>
                            <div className="pt-4 border-t border-black/5 flex justify-between items-end">
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Total</span>
                                <span className="text-4xl font-bold tracking-tighter">${total}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={onCheckout}
                                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group"
                            >
                                Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-[9px] text-center text-black/30 font-bold uppercase tracking-widest">
                                Secure checkout powered by PlanPro Pay
                            </p>
                        </div>

                        <div className="bg-[#FDE7D1]/30 p-6 rounded-3xl space-y-3">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest">PlanPro Membership</h5>
                            <p className="text-[11px] text-black/60 leading-relaxed">Members get free shipping on all orders and early access to new collections.</p>
                            <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartView;
