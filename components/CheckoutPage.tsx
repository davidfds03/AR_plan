import React, { useState } from 'react';
import {
    Lock, CreditCard, ChevronRight, ArrowLeft, Plus,
    Check, Eye, EyeOff, ShoppingBag, Truck, ClipboardCheck,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';

interface CheckoutPageProps {
    cart: { id: string; qty: number }[];
    onBack: () => void;
    onConfirm: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, onBack, onConfirm }) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'other'>('card');
    const [selectedCard, setSelectedCard] = useState(0);
    const [showCVV, setShowCVV] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const cartItems = cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        return { ...product, qty: item.qty } as Product & { qty: number };
    });

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + shipping;

    const toggleItem = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const cards = [
        { id: 0, type: 'Mastercard', last4: '4323', color: 'bg-[#E4E4F4]', textColor: 'text-[#4A4A8F]' },
        { id: 1, type: 'Visa', last4: '5442', color: 'bg-[#FDE7D1]', textColor: 'text-[#A67C52]' },
    ];

    return (
        <div className="min-h-screen bg-[#FBFBF9] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Payment Details */}
                    <div className="lg:col-span-7 bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter uppercase">Payment details</h2>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-black/40">
                                <Lock size={14} />
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Card is secure</p>
                                    <p className="text-[8px] font-medium opacity-60">Your data is protected</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-8 border-b border-black/5 pb-4">
                            {['Credit Card', 'Paypal', 'Other'].map((tab) => {
                                const id = tab.toLowerCase().split(' ')[0] as any;
                                const isActive = paymentMethod === id;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setPaymentMethod(id)}
                                        className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${isActive ? 'text-black' : 'text-black/30 hover:text-black'}`}
                                    >
                                        {tab}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-black"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            {/* Card Selection */}
                            <div className="md:col-span-5 space-y-4">
                                {cards.map((card, idx) => (
                                    <button
                                        key={card.id}
                                        onClick={() => setSelectedCard(idx)}
                                        className={`w-full aspect-[1.6/1] rounded-2xl p-6 text-left transition-all relative overflow-hidden group ${card.color} ${selectedCard === idx ? 'ring-2 ring-black ring-offset-4 scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                            <div className="flex justify-between items-start">
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${card.textColor}`}>{card.type}</div>
                                                <div className={`text-[10px] font-bold ${card.textColor}`}>**** {card.last4}</div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="w-8 h-5 bg-black/10 rounded-sm" />
                                                {selectedCard === idx && (
                                                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">
                                                        <Check size={10} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Abstract patterns inspired by the image */}
                                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                            <div className="absolute top-4 left-4 w-12 h-12 border-4 border-current rounded-full" />
                                            <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-current rounded-full" />
                                        </div>
                                    </button>
                                ))}
                                <button className="w-full aspect-[1.6/1] rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 hover:border-black/20 transition-all group">
                                    <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                        <Plus size={16} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Add new</span>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="md:col-span-7 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Credit card</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            defaultValue="4441 2354 3266 5655"
                                            className="w-full px-6 py-4 bg-black/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 ring-black/5 transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                            <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-80" />
                                            <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-80 -ml-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Annette Murphy"
                                        className="w-full px-6 py-4 bg-black/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 ring-black/5 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Expiration date</label>
                                        <input
                                            type="text"
                                            defaultValue="08 / 2024"
                                            className="w-full px-6 py-4 bg-black/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 ring-black/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">CVV</label>
                                        <div className="relative">
                                            <input
                                                type={showCVV ? "text" : "password"}
                                                defaultValue="407"
                                                className="w-full px-6 py-4 bg-black/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 ring-black/5 transition-all"
                                            />
                                            <button
                                                onClick={() => setShowCVV(!showCVV)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                                            >
                                                {showCVV ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                                    <button
                                        onClick={onConfirm}
                                        className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        Confirm order
                                    </button>
                                    <button
                                        onClick={onBack}
                                        className="text-[10px] font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                                    >
                                        Cancel and Return
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 space-y-8 w-full">
                        <div className="bg-[#F5F5F3] rounded-[40px] p-8 md:p-10 space-y-8">
                            <h3 className="text-3xl font-bold tracking-tighter uppercase">Order summary</h3>

                            {/* Stepper */}
                            <div className="flex items-center justify-between px-2">
                                {[
                                    { icon: Truck, label: 'Shipping', step: 1, color: 'bg-[#E4E4F4]' },
                                    { icon: CreditCard, label: 'Payment', step: 2, color: 'bg-[#FDE7D1]' },
                                    { icon: ClipboardCheck, label: 'Review', step: 3, color: 'bg-[#C1EED0]' },
                                ].map((s) => (
                                    <div key={s.step} className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.step === 2 ? s.color : 'bg-white'} shadow-sm`}>
                                            <s.icon size={18} className={s.step === 2 ? 'text-black' : 'text-black/20'} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-black/20 uppercase tracking-tighter">Step {s.step}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${s.step === 2 ? 'text-black' : 'text-black/30'}`}>{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Item List */}
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className="w-full p-5 flex items-center justify-between hover:bg-black/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/5">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                            </div>
                                            {expandedItems.includes(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedItems.includes(item.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 space-y-3 border-t border-black/5 mt-2">
                                                        <div className="flex justify-between text-[11px]">
                                                            <span className="text-black/40 font-medium">{item.name} (x{item.qty})</span>
                                                            <span className="font-bold">${item.price * item.qty}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px]">
                                                            <span className="text-black/40 font-medium">Estimated shipping</span>
                                                            <span className="font-bold">$0.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px]">
                                                            <span className="text-black/40 font-medium">Discount</span>
                                                            <span className="font-bold">$0.00</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-black/5 flex justify-between text-sm">
                                                            <span className="font-bold">Total</span>
                                                            <span className="font-bold">${item.price * item.qty}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-black/10 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Total Amount:</p>
                                    <h4 className="text-4xl font-bold tracking-tighter">${total}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest">Including taxes</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
