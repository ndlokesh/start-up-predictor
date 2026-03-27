import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, UserPlus, LogIn, CheckCircle, AlertCircle, Building2, Search, DatabaseZap, Globe, DollarSign, MapPin } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [crunchbaseData, setCrunchbaseData] = useState(null);
  const [isFetchingCB, setIsFetchingCB] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchCrunchbaseDetails = async () => {
    if (!companyName) {
      setMessage({ type: 'error', text: 'Please enter a company name first' });
      return;
    }
    
    setIsFetchingCB(true);
    setMessage({ type: '', text: '' });
    
    try {
      const permalink = companyName.toLowerCase().trim().replace(/\s+/g, '-');
      const apiKey = import.meta.env.VITE_CRUNCHBASE_API_KEY || ''; 
      
      if (!apiKey) {
         setTimeout(() => {
           setCrunchbaseData({
             name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
             description: "A visionary AI-driven startup revolutionizing the industry with cutting edge technology.",
             location: "Bangalore, IN",
             funding: "$1.5M Seed",
             website: `https://www.${permalink}.com`
           });
           setMessage({ type: 'success', text: 'Crunchbase details linked successfully (Mock Mode)' });
           setIsFetchingCB(false);
         }, 1500);
         return;
      }
      
      const response = await fetch(`https://api.crunchbase.com/api/v4/entities/organizations/${permalink}?user_key=${apiKey}`);
      
      if (!response.ok) throw new Error('Company not found on Crunchbase');
      
      const data = await response.json();
      const properties = data.properties;
      
      setCrunchbaseData({
        name: properties.identifier.value,
        description: properties.short_description,
        location: properties.location_identifiers ? properties.location_identifiers[0].value : 'Unknown',
        funding: properties.funding_total ? `$${properties.funding_total.value_usd}` : 'Undisclosed',
        website: properties.website_url
      });
      setMessage({ type: 'success', text: 'Crunchbase details fetched!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch Crunchbase details' });
    } finally {
      setIsFetchingCB(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in required fields' });
      return;
    }

    const users = JSON.parse(localStorage.getItem('startupUsers')) || {};

    if (isLoginView) {
      const user = users[email];
      const isPasswordValid = user && (user === password || user.password === password);
      
      if (isPasswordValid) {
        setMessage({ type: 'success', text: 'Login successfully!' });
        setTimeout(() => {
          onLogin();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Invalid email or password' });
      }
    } else {
      if (users[email]) {
        setMessage({ type: 'error', text: 'User already exists. Please login.' });
      } else {
        users[email] = { 
            password, 
            companyName,
            crunchbaseProfile: crunchbaseData 
        };
        localStorage.setItem('startupUsers', JSON.stringify(users));
        setMessage({ type: 'success', text: 'Signed up successfully! Please login.' });
        setTimeout(() => {
          setIsLoginView(true);
          setMessage({ type: '', text: '' });
          setPassword('');
          setCompanyName('');
          setCrunchbaseData(null);
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-2xl relative z-10 transition-all">
        <div>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-neon">
            <Activity size={32} />
          </div>
          <h2 className="mt-6 font-outfit text-center text-3xl font-extrabold text-slate-900">
            Startup<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Predictor</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            {isLoginView ? 'Sign in to your venture dashboard' : 'Register and connect your Startup'}
          </p>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

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

            {!isLoginView && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DatabaseZap size={16} className="text-cyan-500" />
                  Crunchbase Registration
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Building2 className="absolute top-3.5 left-4 text-slate-400" size={20} />
                    <input 
                      name="companyName" type="text" 
                      className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-white" 
                      placeholder="Find Startup via Crunchbase..."
                      value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={fetchCrunchbaseDetails}
                    disabled={isFetchingCB || !companyName}
                    className="flex items-center justify-center p-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-cyan-50 hover:text-cyan-600 transition-colors disabled:opacity-50"
                    title="Fetch from Crunchbase API"
                  >
                    {isFetchingCB ? <Activity size={20} className="animate-spin" /> : <Search size={20} />}
                  </button>
                </div>

                {crunchbaseData && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm text-slate-600">
                    <div className="font-bold text-slate-900 flex justify-between items-center">
                      {crunchbaseData.name}
                      <span className="text-[10px] px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full font-bold uppercase tracking-wide">Crunchbase</span>
                    </div>
                    <p className="text-xs leading-relaxed">{crunchbaseData.description}</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                      <MapPin size={14} className="text-slate-400" /> {crunchbaseData.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-slate-400" /> Funding: {crunchbaseData.funding}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" /> 
                      <a href={crunchbaseData.website} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline hover:text-cyan-700 font-medium">Website</a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg hover:shadow-xl transition-all">
              {isLoginView ? 'Login to Terminal' : 'Register Application'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => { setIsLoginView(!isLoginView); setMessage({ type: '', text: '' }); }}
            className="text-sm font-bold text-slate-500 hover:text-cyan-600 transition flex items-center justify-center gap-2 mx-auto"
          >
            {isLoginView ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isLoginView ? "Don't have an account? Connect Startup" : "Already registered? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
