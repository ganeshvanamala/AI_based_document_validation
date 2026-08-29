import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.login({});
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left side */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-20 border-r border-slate-800 bg-slate-900/50">
        <div className="max-w-md">
          <Shield className="w-16 h-16 text-navy-500 mb-8" />
          <h1 className="text-4xl font-bold text-white mb-4">
            IdentityGuard <span className="text-navy-500">AI</span>
          </h1>
          <h2 className="text-xl text-slate-300 mb-4 font-medium">
            AI-Based Fake Identity & Document Screening
          </h2>
          <p className="text-slate-400 text-lg">
            Intelligent document and identity screening for faster, explainable verification.
          </p>
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-20 relative">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Shield className="w-12 h-12 text-navy-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">IdentityGuard AI</h1>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Officer Login</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Officer ID / Email</label>
                  <input 
                    type="text" 
                    defaultValue="officer@identityguard.gov"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    defaultValue="password123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-navy-500 focus:ring-navy-500" />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <span className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-slate-500">
              Prototype Environment
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
