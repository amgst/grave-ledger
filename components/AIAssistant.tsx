
import React, { useState } from 'react';
import { GraveRecord } from '../types';
import { analyzeGraveRecords } from '../services/geminiService';
import { Sparkles, RefreshCcw, Quote, ChevronLeft } from 'lucide-react';

interface AIAssistantProps {
  records: GraveRecord[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ records }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = async () => {
    if (records.length === 0) return;
    setLoading(true);
    const result = await analyzeGraveRecords(records);
    setAnalysis(result || "موجودہ ڈیٹا میں کوئی خاص رجحان نہیں ملا۔");
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right" dir="rtl">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-amber-400" size={32} />
            <h2 className="text-2xl font-bold">ذہین مددگار</h2>
          </div>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl leading-relaxed">
            تاریخی ریکارڈ، اوسط عمر اور آبادیاتی تبدیلیوں کا تجزیہ کرنے کے لیے مصنوعی ذہانت (AI) کا استعمال کریں۔
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={loading || records.length === 0}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'تجزیہ کیا جا رہا ہے...' : 'AI خلاصہ تیار کریں'}
          </button>
        </div>
      </div>

      {analysis ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-2 mb-6 text-slate-400">
            <Quote size={24} className="rotate-180" />
            <span className="text-sm font-semibold uppercase tracking-widest">تجزیہ کے نتائج</span>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {analysis}
          </div>
        </div>
      ) : !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            "مختلف دہائیوں میں عمر کے رجحانات",
            "قبرستان میں جگہ کے استعمال کی صورتحال",
            "شرحِ اموات کا جائزہ"
          ].map((feature, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <ChevronLeft size={16} className="text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-slate-600">{feature}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
