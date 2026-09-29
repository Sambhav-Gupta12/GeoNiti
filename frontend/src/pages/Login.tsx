import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, FileText, Map as MapIcon, LineChart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Banner } from '@/components/ui/Banner';
import { Wordmark } from '@/components/ui/Wordmark';
import { Tooltip } from '@/components/ui/Tooltip';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: 'System Administrator', email: 'admin@example.com', pass: 'password123', role: 'admin' },
  { label: 'Policy Analyst', email: 'analyst@example.com', pass: 'password123', role: 'policy_analyst' },
  { label: 'Data Administrator', email: 'data_admin@example.com', pass: 'password123', role: 'data_administrator' },
  { label: 'Researcher', email: 'researcher@example.com', pass: 'password123', role: 'researcher' },
  { label: 'Government Official', email: 'official@example.com', pass: 'password123', role: 'official' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    try {
      const res = await api.post<{ access_token: string; user: any }>('/auth/login', data);
      await login(res.access_token, res.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    handleSubmit(onSubmit)();
  };

  const handleGuest = () => {
    // Guest flow: just navigate directly without auth, protected routes will bounce them if not guest-allowed
    // Actually, guest dashboard doesn't require auth token but guest role might. 
    // We can just login as guest demo account if we want, or clear token.
    api.clearToken();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel: Branding & Value Props */}
      <div className="hidden lg:flex w-1/2 bg-primary-950 text-white relative overflow-hidden flex-col p-12 justify-between">
        {/* Subtle Parcel Line Pattern SVG Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="parcels" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 0 100 L 100 0 M 100 100 L 0 0" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="10" y="10" width="40" height="30" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="60" y="20" width="30" height="50" stroke="currentColor" strokeWidth="1" fill="none" />
                <polygon points="10,60 40,50 50,90 20,95" stroke="currentColor" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#parcels)" />
          </svg>
        </div>

        <div className="relative z-10">
          <Wordmark className="text-white brightness-0 invert opacity-90 scale-125 origin-left" />
          <h1 className="mt-12 text-4xl font-serif font-semibold leading-tight text-white/90">
            Spatial intelligence for <br/> evidence-based land policy.
          </h1>
          
          <div className="mt-16 space-y-10">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary-900 rounded-lg shrink-0">
                <FileText className="w-6 h-6 text-primary-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Evidence-Grounded RAG</h3>
                <p className="mt-1 text-primary-200">Chat directly with thousands of curated policy documents and technical reports.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary-900 rounded-lg shrink-0">
                <MapIcon className="w-6 h-6 text-primary-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Geospatial Synthesis</h3>
                <p className="mt-1 text-primary-200">Overlay socio-economic indicators across interactive, high-resolution regional maps.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary-900 rounded-lg shrink-0">
                <LineChart className="w-6 h-6 text-primary-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Scenario Sandboxing</h3>
                <p className="mt-1 text-primary-200">Forecast long-term impacts of policy levers with machine learning models.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-400 text-sm">
          &copy; {new Date().getFullYear()} BhuNiti Platform. For demonstration purposes.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8">
            <Wordmark className="scale-125 origin-left" />
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900">Welcome back</h2>
          <p className="mt-2 text-neutral-500">Sign in to access your workspace.</p>

          {errorMsg && (
            <Banner variant="error" message={errorMsg} className="mt-6" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
              <Input 
                type="email" 
                placeholder="name@example.com"
                error={!!errors.email}
                {...register('email')} 
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-neutral-700">Password</label>
                <Tooltip content="Managed by your organisation">
                  <span className="text-sm font-medium text-neutral-400 cursor-not-allowed">Forgot password?</span>
                </Tooltip>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  error={!!errors.password}
                  {...register('password')} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-2" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-neutral-200">
            <h4 className="text-sm font-medium text-neutral-900 mb-4">Demo access</h4>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.pass)}
                  className="text-left px-4 py-2 border border-neutral-200 rounded-md text-sm text-neutral-600 hover:bg-neutral-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  {acc.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleGuest}
                className="text-left px-4 py-2 border border-neutral-200 rounded-md text-sm text-neutral-600 hover:bg-neutral-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                Continue as guest
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
