
import React, { useState } from 'react';
import { Layout as LayoutIcon, ArrowRight, Mail, Lock, ChevronLeft, Facebook, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        onLoginSuccess();
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;

        // Create user profile in public.User table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('User')
            .upsert([
              {
                id: data.user.id,
                email: data.user.email,
                name: fullName
              }
            ]);
          if (profileError) console.error('Error creating profile:', profileError);
        }

        toast.success('Account created! Please check your email.');
        // If auto-signed in, trigger success
        if (data.session) onLoginSuccess();
        else setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#FBFBF9] flex flex-col h-screen overflow-hidden animate-in fade-in duration-500">

      {/* Top Header Layer - Fixed position, no blur to prevent rendering issues */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex justify-between items-center absolute top-0 left-0 right-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={18} className="text-black/40 group-hover:text-black transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">BACK TO STORE</span>
        </button>

        <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-xl flex items-center justify-center text-white rotate-[-8deg] shadow-xl">
          <LayoutIcon size={18} className="md:size-[20px]" />
        </div>
      </div>

      {/* Centered Form Content - Perfectly centered with no scroll */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700">

          {/* Titles - Scaled for better vertical fit */}
          <div className="space-y-1 text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-black tracking-tight leading-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-black/50 text-[10px] md:text-sm font-medium">Please enter your PlanPro Passport details.</p>
          </div>

          {/* Form - Tighter spacing to fit within height */}
          <form className="space-y-3 md:space-y-5" onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="space-y-1 md:space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 ml-1">FULL NAME</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={16} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-black/5 focus:border-black/20 rounded-[20px] md:rounded-[24px] outline-none transition-all text-sm font-medium placeholder:text-black/20 shadow-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 md:space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 ml-1">EMAIL ADDRESS</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-black/5 focus:border-black/20 rounded-[20px] md:rounded-[24px] outline-none transition-all text-sm font-medium placeholder:text-black/20 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 md:space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 ml-1">PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-black/5 focus:border-black/20 rounded-[20px] md:rounded-[24px] outline-none transition-all text-sm font-medium placeholder:text-black/20 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-[10px] md:text-[11px] px-1 py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md border-black/10 text-black focus:ring-black/20 transition-all cursor-pointer appearance-none bg-white border checked:bg-black"
                />
                <span className="text-black/50 font-semibold group-hover:text-black transition-colors">Remember me</span>
              </label>
              <button type="button" className="font-bold text-black hover:opacity-60 transition-opacity">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 md:py-4 bg-black text-white rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-black/10 group mt-2 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'JOIN PLANPRO')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Switch & Social */}
          <div className="space-y-6 md:space-y-8 pt-2">
            <p className="text-[11px] md:text-sm font-medium text-black/60 text-center">
              {isLogin ? "Don't have an account?" : "Already a member?"} {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black font-extrabold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>

            {isLogin && (
              <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10"></div></div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black text-black/50">
                    <span className="bg-[#FBFBF9] px-6">OR CONTINUE WITH</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button className="flex items-center justify-center gap-3 py-3 rounded-[16px] md:rounded-[20px] bg-white border border-black/5 hover:border-black hover:shadow-lg transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-widest group">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" /> GOOGLE
                  </button>
                  <button className="flex items-center justify-center gap-3 py-3 rounded-[16px] md:rounded-[20px] bg-white border border-black/5 hover:border-black hover:shadow-lg transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-widest group">
                    <Facebook size={16} className="text-[#1877F2] group-hover:scale-110 transition-transform" /> FACEBOOK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
