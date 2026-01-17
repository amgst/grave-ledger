
import React, { useState } from 'react';
import { GraveRecord, Gender } from '../types';
import { Search, User, Hash, Edit2, Phone, Heart, Image as ImageIcon, LayoutGrid, List as ListIcon, Calendar, Info, MapPin } from 'lucide-react';

interface GraveTableProps {
  records: GraveRecord[];
  onEdit: (record: GraveRecord) => void;
}

type ViewMode = 'card' | 'list';

const GraveTable: React.FC<GraveTableProps> = ({ records, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const filteredRecords = records.filter(record => 
    record.deceasedFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.graveNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Search and Layout Toggle Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group w-full md:flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="نام یا قبر کا نمبر تلاش کریں..."
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 shrink-0 self-end md:self-center">
          <button 
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'card' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={18} />
            <span>کارڈ</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ListIcon size={18} />
            <span>فہرست</span>
          </button>
        </div>
      </div>

      {/* Records Display */}
      {filteredRecords.length > 0 ? (
        <div className={viewMode === 'card' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
        }>
          {viewMode === 'card' ? (
            // ENHANCED CARD LAYOUT
            filteredRecords.map((record) => (
              <div 
                key={record.id} 
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden flex flex-col text-right cursor-pointer"
                onClick={() => onEdit(record)}
              >
                {/* Status Bar */}
                <div className="h-1.5 w-full bg-emerald-500"></div>
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex gap-4 mb-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-slate-50 flex items-center justify-center text-slate-200 shadow-sm transition-transform duration-500 group-hover:scale-105">
                      {record.imageUrl ? (
                        <img src={record.imageUrl} className="w-full h-full object-cover" alt="Grave" />
                      ) : (
                        <ImageIcon size={32} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col py-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <h3 className="font-bold text-xl text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors">{record.deceasedFullName}</h3>
                          {record.husbandName && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-pink-50 text-pink-600 rounded-lg w-fit">
                              <Heart size={10} fill="currentColor" />
                              <span className="text-[10px] font-bold">اہلیہ {record.husbandName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <User size={14} className="text-slate-300" />
                        <span className="text-xs font-medium truncate">{record.parentNames}</span>
                      </div>

                      <div className="mt-auto flex items-center gap-2">
                         <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[12px] font-black flex items-center gap-1 border border-emerald-100">
                          <Hash size={12} /> {record.graveNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={12} className="text-emerald-500" />
                        <p className="font-bold text-slate-400 text-[10px] uppercase">تاریخ وفات</p>
                      </div>
                      <p className="text-slate-700 font-bold text-sm">{record.dateOfDeath ? new Date(record.dateOfDeath).toLocaleDateString('ur-PK') : 'نامعلوم'}</p>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Info size={12} className="text-emerald-500" />
                        <p className="font-bold text-slate-400 text-[10px] uppercase">عمر مبارک</p>
                      </div>
                      <p className="text-slate-700 font-bold text-sm">{record.ageAtDeath} <span className="text-[10px] text-slate-400 font-normal">سال</span></p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2">
                    {record.relativeContact && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl transition-colors group-hover:bg-emerald-100">
                        <Phone size={14} />
                        <span className="font-bold text-sm" dir="ltr">{record.relativeContact}</span>
                      </div>
                    )}
                    {record.notes && (
                       <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {record.notes}
                       </p>
                    )}
                  </div>
                </div>
                
                {/* Floating Edit Button */}
                <div className="absolute top-4 left-4 transform -translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                   <button className="p-3 bg-white text-emerald-600 rounded-full shadow-lg border border-emerald-50 hover:bg-emerald-600 hover:text-white transition-all">
                      <Edit2 size={18} />
                   </button>
                </div>
              </div>
            ))
          ) : (
            // ENHANCED LIST LAYOUT
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">قبر نمبر</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">تفصیلاتِ مرحوم</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">تاریخ وفات</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">عمر</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">رابطہ نمبر</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">عمل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                      onClick={() => onEdit(record)}
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 rounded-xl font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                          {record.graveNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {record.imageUrl ? (
                              <img src={record.imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base leading-none mb-1.5 group-hover:text-emerald-800 transition-colors">{record.deceasedFullName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{record.parentNames}</span>
                              {record.husbandName && <span className="text-[10px] bg-pink-50 text-pink-500 px-1.5 py-0.5 rounded-md font-bold">زوجہ {record.husbandName}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-300" />
                          {record.dateOfDeath ? new Date(record.dateOfDeath).toLocaleDateString('ur-PK') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-700">
                          {record.ageAtDeath} <span className="text-[10px] text-slate-400 font-normal">سال</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 font-mono bg-slate-50 group-hover:bg-white px-3 py-1 rounded-lg inline-block transition-colors" dir="ltr">
                          {record.relativeContact || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 text-center space-y-6 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <Search size={48} />
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-slate-500 font-black text-xl mb-2">کوئی ریکارڈ نہیں ملا</p>
            <p className="text-sm text-slate-400 leading-relaxed">براہ کرم تلاش کے لیے کوئی دوسرا نام یا قبر کا نمبر استعمال کریں۔</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraveTable;
