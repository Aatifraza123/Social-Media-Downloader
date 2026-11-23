import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowDownToLine, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useDownloads';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: brandingData } = useBranding();
  const settings = brandingData?.data || {};

  const appName = settings.appName || 'Social Media Downloader Pro';
  const appDescription = settings.appDescription || 'Enterprise Ingestion & Media Transcoder Console';
  const loginFooter = settings.loginFooter || 'Protected by JWT • Single-Tenant Private Instance';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Admin authentication verified');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'admin@example.com');
    setValue('password', 'AdminPassword123!');
    toast.success('Applied admin credentials');
  };

  return (
    <div className="min-h-screen bg-surface-ground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Sheen Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white mb-3 shadow-glow-indigo border border-white/20">
            <ArrowDownToLine className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {appName}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {appDescription}
          </p>
        </div>

        {/* Login Card */}
        <div className="saas-card p-6 shadow-2xl border-surface-border">
          {/* Badge */}
          <div className="flex items-center justify-between mb-5 p-2.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Private Node Session</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <Key className="w-3 h-3" /> Auto-fill
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@example.com"
                  className="input-field pl-9 py-2 text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-9 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 px-4 text-xs font-semibold gap-2 shadow-glow-indigo mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Node...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Ingestion Console</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-zinc-500 mt-6 font-mono">
          {loginFooter}
        </p>
      </div>
    </div>
  );
}
