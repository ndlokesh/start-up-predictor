import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, AlertTriangle, Layers, DownloadCloud, Fingerprint, Target, LogOut } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Login from './Login';
import Chatbot from './Chatbot';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [formData, setFormData] = useState({
    industry: 'SaaS',
    state: 'Maharashtra',
    district: '',
    funding_rounds: 3,
    total_funding_inr: 25000000,
    team_size: 10,
    competitor_density: 12,
    founder_experience_years: 5,
    has_patent: 0
  });

  const [metadata, setMetadata] = useState({ industries: [], states: {} });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    if(!isAuth) return;
    fetch('http://localhost:8000/metadata')
      .then(res => res.json())
      .then(data => {
        if (data.industries && Object.keys(data.states).length > 0) {
          setMetadata({ industries: data.industries, states: data.states });
          // Initialize district matching the default state if blank
          setFormData(prev => ({
            ...prev, 
            district: data.states['Maharashtra'] ? data.states['Maharashtra'][0] : Object.values(data.states)[0][0]
          }));
        }
      })
      .catch(err => {
        console.error("Failed to fetch metadata", err);
      });
  }, [isAuth]);

  // Real-time debounce fetch
  const fetchPrediction = useCallback(async (currentData) => {
    if(!isAuth) return;
    if(!currentData.district) return; // wait till state-district is populated properly
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: currentData.industry,
          location: `${currentData.state} - ${currentData.district}`,
          funding_rounds: Number(currentData.funding_rounds),
          total_funding_inr: Number(currentData.total_funding_inr),
          team_size: Number(currentData.team_size),
          competitor_density: Number(currentData.competitor_density),
          founder_experience_years: Number(currentData.founder_experience_years),
          has_patent: Number(currentData.has_patent)
        })
      });
      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      setPrediction(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  // Debounced listener
  useEffect(() => {
    if(!isAuth) return;
    const timer = setTimeout(() => {
      fetchPrediction(formData);
    }, 600);
    return () => clearTimeout(timer);
  }, [formData, fetchPrediction, isAuth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
       if(metadata.states[value]) {
         setFormData(prev => ({ ...prev, state: value, district: metadata.states[value][0] }));
       }
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Startup_Prognosis_Report.pdf`);
  };

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-x-hidden pb-12">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <nav className="glass-card sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-neon">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-outfit font-bold tracking-tight text-slate-900">
            Startup<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Predictor</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-sm text-sm font-bold">
            <DownloadCloud size={18} /> Export PDF Pitch
          </button>
          <button onClick={() => setIsAuth(false)} className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white shadow-sm border border-slate-200 rounded-xl hover:text-red-500 transition">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main ref={dashboardRef} className="max-w-7xl mx-auto px-6 py-10 relative z-10 grid lg:grid-cols-12 gap-8 items-start bg-[#f8fafc]">
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-outfit font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-500" size={24} /> Interactive Simulator
              </h2>
              {loading && <div className="w-4 h-4 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin"></div>}
            </div>

            <form className="space-y-5">
              
              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase">Industry</label>
                 <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500">
                   {metadata.industries.map(i => <option key={i} value={i}>{i}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">State</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500">
                    {Object.keys(metadata.states).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">District</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500">
                    {(metadata.states[formData.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <label>Total Funding (INR)</label>
                  <span className="text-blue-600">₹{Number(formData.total_funding_inr).toLocaleString()}</span>
                </div>
                <input type="range" name="total_funding_inr" value={formData.total_funding_inr} onChange={handleChange} min="500000" max="500000000" step="500000" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <label>Team Size</label>
                  <span className="text-blue-600">{formData.team_size} Members</span>
                </div>
                <input type="range" name="team_size" value={formData.team_size} onChange={handleChange} min="1" max="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <label>Founder Experience</label>
                  <span className="text-blue-600">{formData.founder_experience_years} Years</span>
                </div>
                <input type="range" name="founder_experience_years" value={formData.founder_experience_years} onChange={handleChange} min="0" max="30" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <label>Competitor Density</label>
                  <span className="text-blue-600">{formData.competitor_density} Entities</span>
                </div>
                <input type="range" name="competitor_density" value={formData.competitor_density} onChange={handleChange} min="0" max="30" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Patent Secured</label>
                  <select name="has_patent" value={formData.has_patent} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Funding Rounds</label>
                  <input type="number" name="funding_rounds" value={formData.funding_rounds} onChange={handleChange} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Side: Prediction & Benchmarks */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-xl relative flex flex-col items-center">
            <h2 className="text-xl font-outfit font-bold text-slate-800 mb-2">Real-time Viability Forecast</h2>
            
            <div className="relative w-56 h-56 flex items-center justify-center my-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="url(#cyanBlueGrad)" strokeWidth="8" strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 300" }}
                  animate={{ strokeDasharray: `${prediction ? (prediction.success_probability * 2.82) : 0}, 300` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="cyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-outfit font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-700">
                  {prediction ? prediction.success_probability.toFixed(0) : '--'}
                  <span className="text-3xl">%</span>
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">SUCCESS</span>
              </div>
            </div>

            <div className="w-full grid md:grid-cols-2 gap-4 mt-2">
               {prediction?.benchmark && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4"><Target size={18} className="text-blue-500"/> Unicorn Benchmark Gap</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-500 uppercase tracking-wide">
                        <span>Funding (₹) vs Series A</span>
                        <span>{Math.round((formData.total_funding_inr / prediction.benchmark.funding) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((formData.total_funding_inr / prediction.benchmark.funding)*100, 100)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-500 uppercase tracking-wide">
                        <span>Team Size vs Peers</span>
                        <span>{Math.round((formData.team_size / prediction.benchmark.team) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min((formData.team_size / prediction.benchmark.team)*100, 100)}%` }}></div></div>
                    </div>
                  </div>
                </div>
              )}

              {prediction && (
                <div className={`rounded-2xl p-5 flex flex-col justify-center shadow-lg ${prediction.success_probability < 50 ? 'bg-red-50 text-red-900 border-red-200 border-2' : 'bg-emerald-50 text-emerald-900 border-emerald-200 border-2'}`}>
                  <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${prediction.success_probability < 50 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {prediction.success_probability < 50 ? <AlertTriangle size={18}/> : <ShieldCheck size={18}/>}
                    {prediction.analysis}
                  </h4>
                  <p className="text-xs text-slate-800 mb-3 leading-snug font-medium opacity-90">{prediction.explanation}</p>
                  <ul className="list-disc pl-4 text-[11px] text-slate-800 space-y-1 font-semibold opacity-90">
                    {prediction.tips?.slice(0,2).map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl flex flex-col md:flex-row items-center gap-6 h-full min-h-[220px]">
            <div className="h-56 w-56 shrink-0 relative flex items-center justify-center">
               {prediction?.feature_impacts ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={prediction.feature_impacts}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Radar name="Impact" dataKey="A" stroke="#00e5ff" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                 </ResponsiveContainer>
               ) : (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin"></div>
               )}
            </div>
            <div className="flex-1 py-4">
              <h3 className="text-lg font-outfit font-bold text-slate-900 flex items-center gap-2 mb-3"><Fingerprint className="text-blue-500" size={20}/> ML Feature Importance</h3>
              <p className="text-sm text-slate-600 tracking-wide font-medium leading-relaxed mb-3">
                The SHAP-driven radar chart illustrates which specific startup metrics impact the Random Forest classification most heavily. Keep sliding the simulator tools to alter your venture's DNA.
              </p>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div> Random Forest Insights
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}

export default App;
