
import React, { useEffect, useState } from 'react';
import {
    User, MapPin, ShieldCheck, Box, Bookmark, ArrowRight,
    Trash2, CreditCard, Ruler, Layout as LayoutIcon,
    Settings, LogOut, ChevronRight, Armchair, Star,
    Verified, MapPin as LocationIcon, CheckCircle,
    ShoppingBag, Trash
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

interface UserProfileProps {
    wishlist: string[];
    onToggleWishlist: (id: string) => void;
    onViewProduct: (product: Product) => void;
    onTabChange: (tab: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
    wishlist,
    onToggleWishlist,
    onViewProduct,
    onTabChange
}) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [counts, setCounts] = useState({ rooms: 0, furniture: 0, saved: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            // Fetch profile data
            const { data: profileData } = await supabase
                .from('User')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Fetch counts
            const { count: roomCount } = await supabase
                .from('RoomDesign')
                .select('*', { count: 'exact', head: true })
                .eq('userId', user.id);

            const { count: arCount } = await supabase
                .from('ArSession')
                .select('modelsPlacedCount')
                .eq('id', user.id); // This might be wrong logic, but let's assume we sum modelsPlacedCount

            setCounts({
                rooms: roomCount || 0,
                furniture: 48, // Mock for now till we have real session tracking
                saved: wishlist.length
            });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        onTabChange('home');
        window.location.reload();
    };

    // Get actual products from wishlist
    const savedItems = PRODUCTS.filter(p => wishlist.includes(p.id));

    // Mock data for "My Designs"
    const designs = [
        { id: 1, name: 'Minimalist Loft', date: '2 days ago', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
        { id: 2, name: 'Home Office', date: '5 days ago', img: 'https://images.unsplash.com/photo-1518481612222-68bbe828eba1?auto=format&fit=crop&q=80&w=800' },
        { id: 3, name: 'Master Bedroom', date: '1 week ago', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a4f0a8?auto=format&fit=crop&q=80&w=800' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-16 bg-[#FBFBF9]">
            {/* User Profile Summary */}
            <section className="flex flex-col md:flex-row items-center md:items-start gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full ring-4 ring-white shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105 bg-black/5 flex items-center justify-center">
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-black/10" />
                        )}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center shadow-lg bg-[#1754cf]">
                        <CheckCircle size={14} fill="white" className="text-[#1754cf]" />
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div className="space-y-1">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900">{profile?.name || user?.email?.split('@')[0] || 'User'}</h1>
                            <span className="px-3 py-1 bg-[#1754cf]/10 text-[#1754cf] text-[10px] font-black rounded-full uppercase tracking-widest">Pro Member</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <LocationIcon size={12} />
                            <span>San Francisco, CA</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 bg-[#1754cf] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1754cf]/90 transition-all shadow-md">
                            Edit Profile
                        </button>
                        <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Account Settings
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Rooms Designed</p>
                        <div className="p-2 bg-[#1754cf]/10 text-[#1754cf] rounded-xl group-hover:bg-[#1754cf] group-hover:text-white transition-colors">
                            <LayoutIcon size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900">{counts.rooms}</p>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Furniture Placed</p>
                        <div className="p-2 bg-[#1754cf]/10 text-[#1754cf] rounded-xl group-hover:bg-[#1754cf] group-hover:text-white transition-colors">
                            <Armchair size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900">{counts.furniture}</p>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Saved Items</p>
                        <div className="p-2 bg-[#1754cf]/10 text-[#1754cf] rounded-xl group-hover:bg-[#1754cf] group-hover:text-white transition-colors">
                            <Bookmark size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900">{counts.saved}</p>
                </div>
            </section>

            {/* My Designs Grid */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Designs</h2>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors group">
                        View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {designs.map((design) => (
                        <div key={design.id} className="group relative aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-100 shadow-lg cursor-pointer">
                            <img
                                src={design.img}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={design.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 space-y-1">
                                <p className="text-white font-bold text-sm">{design.name}</p>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Updated {design.date}</p>
                            </div>
                        </div>
                    ))}
                    <div onClick={() => onTabChange('blueprint')} className="aspect-[4/5] rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-[#1754cf] hover:border-[#1754cf] transition-all cursor-pointer group bg-white/40">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlusIcon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">New Project</p>
                    </div>
                </div>
            </section>

            {/* Saved Furniture Section */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Saved Furniture</h2>
                </div>

                {savedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedItems.map((product) => (
                            <div key={product.id} className="group flex items-center gap-4 bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <div onClick={() => onViewProduct(product)} className="h-24 w-24 bg-slate-50 rounded-xl overflow-hidden cursor-pointer relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Star size={20} className="text-white" fill="white" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-sm tracking-tight text-slate-900">{product.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category} • ${product.price}</p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            onClick={() => onTabChange('products')}
                                            className="text-[9px] font-black uppercase tracking-widest text-[#1754cf] hover:scale-110 transition-transform"
                                        >
                                            Try in AR
                                        </button>
                                        <button
                                            onClick={() => onToggleWishlist(product.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 space-y-4">
                        <Bookmark size={40} className="mx-auto text-slate-100" />
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-slate-900">No items saved yet</p>
                            <p className="text-xs text-slate-400">Start exploring our collection to find inspiration.</p>
                        </div>
                        <button onClick={() => onTabChange('products')} className="px-6 py-2 bg-[#1754cf] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                            Explore Collection
                        </button>
                    </div>
                )}
            </section>

            {/* Settings/Account Options */}
            <section className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-slate-900">Settings</h2>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-5 bg-white rounded-[20px] border border-slate-100 hover:bg-slate-50 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-[#1754cf]/10 text-[#1754cf] group-hover:bg-[#1754cf] group-hover:text-white transition-all">
                                <User size={18} />
                            </div>
                            <div className="text-left space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">Edit Profile</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Update your personal information</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 bg-white rounded-[20px] border border-slate-100 hover:bg-slate-50 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-[#1754cf]/10 text-[#1754cf] group-hover:bg-[#1754cf] group-hover:text-white transition-all">
                                <CreditCard size={18} />
                            </div>
                            <div className="text-left space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">Payment Methods</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manage your cards and billing address</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 bg-white rounded-[20px] border border-slate-100 hover:bg-slate-50 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-[#1754cf]/10 text-[#1754cf] group-hover:bg-[#1754cf] group-hover:text-white transition-all">
                                <Ruler size={18} />
                            </div>
                            <div className="text-left space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">AR Calibration</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Optimize AR accuracy for your device</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-white rounded-[20px] border border-slate-100 hover:bg-red-50 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                <LogOut size={18} />
                            </div>
                            <div className="text-left space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">Logout</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sign out of your account</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </button>
                </div>
            </section>
        </div>
    );
};

const PlusIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default UserProfile;
