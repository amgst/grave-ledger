
import React from 'react';
import { GraveRecord } from '../types';
import { Users, Hash, Calendar, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  records: GraveRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const avgAge = records.length > 0 
    ? Math.round(records.reduce((acc, r) => acc + r.ageAtDeath, 0) / records.length) 
    : 0;

  const thisYearCount = records.filter(r => 
    new Date(r.dateOfDeath).getFullYear() === new Date().getFullYear()
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="bg-emerald-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/20">
        <h1 className="text-2xl font-bold mb-1">خلاصہ</h1>
        <p className="text-emerald-100/70 text-sm mb-6">قبرستان کے ریکارڈ کا جائزہ۔</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">کل ریکارڈ</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{records.length}</span>
              <Users size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">اوسط عمر</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{avgAge}</span>
              <Calendar size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Calendar size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">اس سال کے اندراج</p>
              <p className="text-xs text-slate-500">{thisYearCount} نئے ریکارڈ</p>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-200">{thisYearCount}</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Hash size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">آخری الاٹ شدہ نمبر</p>
              <p className="text-xs text-slate-500">حالیہ اندراج کی بنیاد پر</p>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-200">
            {records.length > 0 ? records[0].graveNumber : 'کوئی نہیں'}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">حالیہ سرگرمی</h3>
        <div className="space-y-3">
          {records.slice(0, 3).map(r => (
            <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="text-right">
                <p className="font-bold text-slate-700 text-sm">{r.deceasedFullName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">تاریخ وفات: {r.dateOfDeath}</p>
              </div>
              <ArrowLeft size={14} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
