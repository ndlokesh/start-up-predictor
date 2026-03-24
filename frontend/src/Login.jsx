import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-2xl relative z-10">
        <div>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-neon">
            <Activity size={32} />
          </div>
          <h2 className="mt-6 font-outfit text-center text-3xl font-extrabold text-slate-900">
            Startup<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Predictor</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Sign in to access your venture dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute top-3.5 left-4 text-slate-400" size={20} />
              <input 
                name="email" type="email" required 
                className="appearance-none relative block w-full px-12 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 text-sm bg-white" 
                placeholder="Email address"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-3.5 left-4 text-slate-400" size={20} />
              <input 
                name="password" type="password" required 
                className="appearance-none relative block w-full px-12 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 text-sm bg-white" 
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg hover:shadow-xl transition-all">
              Initialize Terminal
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
