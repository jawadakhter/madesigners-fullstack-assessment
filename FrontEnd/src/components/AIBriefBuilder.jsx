// src/components/AIBriefBuilder.jsx
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AIBriefBuilder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const pdfRef = useRef();

  const [formData, setFormData] = useState({ clientName: '', budget: '', objective: '', preferences: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitToAI = async () => {
    setLoading(true);
    setTimeout(() => {
      setAiResponse({
        title: `${formData.clientName} - AI Strategic Campaign Brief`,
        headlines: ["Ignite Your Brand's Potential", "Smart Advertising, Real Results", "Connect with Your Audience Today"],
        visual: "A high-contrast cinematic shot showing a diverse group of young professionals interacting with a glowing digital interface, representing forward-thinking technology."
      });
      setLoading(false);
      setStep(5);
    }, 2500);
  };

  const exportPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.clientName || 'Campaign'}_Brief.pdf`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 lg:p-12 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-3 mb-8 border-b pb-6 dark:border-slate-800">
        <Sparkles className="text-purple-500" size={32} />
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Brief Generator</h2>
      </div>
      
      {/* Premium Step Indicator */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-0 transition-all duration-500" style={{ width: `${Math.min(((step - 1) / 3) * 100, 100)}%` }}></div>
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${step >= s ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'}`}>
            {step > s ? <CheckCircle2 size={20} /> : s}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="min-h-[250px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client / Brand Name</label>
              <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Lumiere Cosmetics" />
            </div>
            <button onClick={() => setStep(2)} disabled={!formData.clientName} className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">Next Step &rarr;</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Campaign Budget ($)</label>
              <input type="text" name="budget" value={formData.budget} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all" placeholder="e.g. $50,000" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Back</button>
              <button onClick={() => setStep(3)} className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all">Next Step &rarr;</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Creative Direction (Tone & Style)</label>
              <textarea name="preferences" value={formData.preferences} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all" rows="4" placeholder="e.g. Modern, minimalist, focus on Gen-Z audience..."></textarea>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Back</button>
              <button onClick={() => setStep(4)} className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all">Review Info</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Confirm Details</h3>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p><strong className="text-slate-900 dark:text-white">Client:</strong> {formData.clientName}</p>
                <p><strong className="text-slate-900 dark:text-white">Budget:</strong> {formData.budget}</p>
                <p><strong className="text-slate-900 dark:text-white">Style:</strong> {formData.preferences}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all">Edit</button>
              <button onClick={submitToAI} disabled={loading} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 flex items-center transition-all hover:scale-105">
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Sparkles className="mr-2" size={20} />}
                {loading ? 'Analyzing with AI...' : 'Generate Magic'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && aiResponse && (
          <div className="animate-in zoom-in-95 duration-500">
            {/* The Document to be exported - FIXED FOR HTML2CANVAS */}
            <div 
              ref={pdfRef} 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', fontFamily: 'serif' }}
            >
               <div style={{ borderBottom: '4px solid #0f172a', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
                 <p style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>AdAgency Intelligence</p>
                 <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>{aiResponse.title}</h1>
               </div>
               
               <div style={{ marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Suggested Copy / Headlines</h3>
                 <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                   {aiResponse.headlines.map((hl, i) => (
                     <li key={i} style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#22c55e', marginRight: '12px' }}>✓</span> "{hl}"
                     </li>
                   ))}
                 </ul>
               </div>

               <div>
                 <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Key Visual Direction</h3>
                 <p style={{ fontSize: '18px', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #f1f5f9', fontStyle: 'italic', margin: 0 }}>
                   {aiResponse.visual}
                 </p>
               </div>
            </div>
            
            <button onClick={exportPDF} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex justify-center items-center text-lg font-bold shadow-xl transition-all hover:-translate-y-1">
              <Download className="mr-2" size={24} /> Download Presentation PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}