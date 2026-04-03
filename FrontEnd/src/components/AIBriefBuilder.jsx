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

  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    website: '',
    competitors: '',
    objective: '',
    targetAudience: '',
    budget: '',
    tone: '',
    imageryStyle: '',
    colorDirection: '',
    dos: '',
    donts: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitToAI = async () => {
    setLoading(true);
    try {
      // 1. Backend ki AI API ko request bhejein
      // Agar backend par JWT authentication lazmi hai toh headers mein token add karna parre ga.
      const token = localStorage.getItem('token'); // Misaal ke tor par, agar aapne token save kiya hai

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Agar API token mangti hai toh isay uncomment karein
        },
        body: JSON.stringify(formData) // Form ka data backend ko bhej rahe hain
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // 2. AI ka response set karein aur aagay wale step par jayen
      setAiResponse(data);
      setStep(5);

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("AI Brief Generate karne mein masla aya. Server check karein.");

      // Fallback: Agar API fail ho jaye toh test ke liye temporary data dikha dein
      setAiResponse({
        title: `${formData.clientName} - Fallback Campaign Brief`,
        headlines: ["Connect. Engage. Grow.", "Innovation at your fingertips.", "The future is now."],
        toneGuide: "Professional and engaging (Fallback)",
        channels: [
          { "name": "Facebook", "percentage": 50 },
          { "name": "Twitter", "percentage": 30 },
          { "name": "LinkedIn", "percentage": 20 }
        ],
        visual: "A sleek, modern visualization representing connectivity. (Fallback)"
      });
      setStep(5);
    } finally {
      setLoading(false);
    }
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

      {/* Step Indicator with Labels Added */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
        <div className="absolute left-0 top-5 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-0 transition-all duration-500"
          style={{ width: `${Math.min(((step - 1) / 3) * 100, 100)}%` }}></div>
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Objective' },
          { num: 3, label: 'Creative' },
          { num: 4, label: 'Review' }
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${step >= s.num ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'}`}>
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className={`text-xs font-bold ${step >= s.num ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[300px]">

        {/* STEP 1 — Client Details (COMPLETE) */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Client Details</h3>
            {[
              { label: 'Client / Brand Name', name: 'clientName', placeholder: 'e.g. Lumiere Cosmetics', required: true },
              { label: 'Industry', name: 'industry', placeholder: 'e.g. Beauty & Skincare', required: true },
              { label: 'Website URL', name: 'website', placeholder: 'e.g. https://lumiere.com', required: false },
              { label: 'Key Competitors', name: 'competitors', placeholder: 'e.g. L\'Oreal, Olay, Neutrogena', required: false },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                <input type="text" name={field.name} value={formData[field.name]} onChange={handleChange}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder={field.placeholder} />
                {/* Validation Error Message */}
                {field.required && !formData[field.name] && <p className="text-red-500 text-xs mt-1">{field.label} is required</p>}
              </div>
            ))}
            <button onClick={() => setStep(2)} disabled={!formData.clientName || !formData.industry}
              className="mt-4 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 transition-all">
              Next Step →
            </button>
          </div>
        )}

        {/* STEP 2 — Campaign Objective (COMPLETE) */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Campaign Objective</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Objective</label>
              <select name="objective" value={formData.objective} onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                <option value="">Select Objective</option>
                <option value="Awareness">Brand Awareness</option>
                <option value="Consideration">Consideration / Traffic</option>
                <option value="Conversion">Conversion / Sales</option>
              </select>
              {!formData.objective && <p className="text-red-500 text-xs mt-1">Select a campaign objective</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
              <input type="text" name="targetAudience" value={formData.targetAudience} onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. Women 25-35, urban, health-conscious" />
              {!formData.targetAudience && <p className="text-red-500 text-xs mt-1">Target Audience is required</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Campaign Budget ($)</label>
              <input type="text" name="budget" value={formData.budget} onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. $50,000" />
              {!formData.budget && <p className="text-red-500 text-xs mt-1">Budget is required</p>}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all">Back</button>
              <button onClick={() => setStep(3)} disabled={!formData.budget || !formData.objective || !formData.targetAudience}
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 transition-all">
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Creative Preferences (COMPLETE) */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Creative Direction</h3>
            {[
              { label: 'Tone of Voice', name: 'tone', placeholder: 'e.g. Modern, playful, empowering', required: true },
              { label: 'Imagery Style', name: 'imageryStyle', placeholder: 'e.g. Minimalist product shots, lifestyle photography', required: true },
              { label: 'Color Direction', name: 'colorDirection', placeholder: 'e.g. Soft pastels, white and gold', required: true },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                <input type="text" name={field.name} value={formData[field.name]} onChange={handleChange}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder={field.placeholder} />
                {field.required && !formData[field.name] && <p className="text-red-500 text-xs mt-1">{field.label} is required</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Do's</label>
              <textarea name="dos" value={formData.dos} onChange={handleChange} rows="2"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. Use real skin textures, show diversity" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Don'ts</label>
              <textarea name="donts" value={formData.donts} onChange={handleChange} rows="2"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. No heavy filters, avoid competitor comparisons" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all">Back</button>
              <button onClick={() => setStep(4)}
                disabled={!formData.tone || !formData.imageryStyle || !formData.colorDirection}
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 transition-all">
                Review Info
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Confirm Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400 text-sm">
                {[
                  ['Client', formData.clientName], ['Industry', formData.industry],
                  ['Website', formData.website], ['Competitors', formData.competitors],
                  ['Objective', formData.objective], ['Target Audience', formData.targetAudience],
                  ['Budget', formData.budget], ['Tone', formData.tone],
                  ['Imagery', formData.imageryStyle], ['Colors', formData.colorDirection],
                ].map(([label, value]) => value ? (
                  <p key={label}><strong className="text-slate-900 dark:text-white">{label}:</strong> {value}</p>
                ) : null)}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all">Edit</button>
              <button onClick={submitToAI} disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'AI is thinking...' : 'Generate Magic'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — AI Output */}
        {step === 5 && aiResponse && (
          <div>
            <div ref={pdfRef} style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', fontFamily: 'serif' }}>
              <div style={{ borderBottom: '4px solid #0f172a', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>AdAgency Intelligence</p>
                <h1 style={{ fontSize: '30px', fontWeight: '800', margin: 0 }}>{aiResponse.title}</h1>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Suggested Headlines</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {aiResponse.headlines?.map((hl, i) => (
                    <li key={i} style={{ fontSize: '16px', marginBottom: '10px' }}>✓ "{hl}"</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Tone of Voice</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.6', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>{aiResponse.toneGuide}</p>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Recommended Channels</h3>
                {aiResponse.channels?.map((ch, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{ch.name}</span>
                      <span style={{ fontSize: '14px' }}>{ch.percentage}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                      <div style={{ height: '8px', width: `${ch.percentage}%`, backgroundColor: '#7e22ce', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#7e22ce', borderLeft: '4px solid #a855f7', paddingLeft: '12px' }}>Key Visual Direction</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', fontStyle: 'italic' }}>{aiResponse.visual}</p>
              </div>
            </div>

            <button onClick={exportPDF} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex justify-center items-center text-lg font-bold shadow-xl transition-all hover:-translate-y-1">
              <Download className="mr-2" size={24} /> Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}