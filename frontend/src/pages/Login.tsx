import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Wordmark } from '@/components/ui/Wordmark';
import { useToast } from '@/components/ui/Toast';

export default function Login() {
  const [email, setEmail] = useState('analyst@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string; user: any }>('/auth/login', { email, password });
      await login(res.access_token, res.user);
      navigate('/');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Login Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-neutral-200/60">
        <CardHeader className="items-center space-y-4 pb-8">
          <Wordmark className="scale-125 origin-bottom" />
          <CardTitle className="text-2xl font-bold">Sign in to BhuNiti</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-6" isLoading={loading}>
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-neutral-100 text-sm text-neutral-500">
            <p className="font-medium text-neutral-700 mb-2">Demo Accounts:</p>
            <ul className="space-y-1">
              <li>admin@example.com</li>
              <li>analyst@example.com</li>
              <li>guest@example.com</li>
            </ul>
            <p className="mt-2 text-xs">Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
