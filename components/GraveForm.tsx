
import React, { useState, useEffect, useRef } from 'react';
import { GraveRecord, Gender } from '../types';
import { Sparkles, User, Calendar, Hash, ArrowRight, Phone, Heart, Camera, Upload, Trash2, Loader2, Info } from 'lucide-react';
import { suggestNotes, extractGraveInfoFromImage } from '../services/geminiService';

interface GraveFormProps {
  onSave: (record: Omit<GraveRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: GraveRecord;
  suggestedGraveNumber?: string;
}

const GraveForm: React.FC<GraveFormProps> = ({ onSave, onCancel, initialData, suggestedGraveNumber }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    deceasedFullName: initialData?.deceasedFullName || '',
    parentNames: initialData?.parentNames || '',
    husbandName: initialData?.husbandName || '',
    relativeContact: initialData?.relativeContact || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    dateOfDeath: initialData?.dateOfDeath || '',
    gender: initialData?.gender || Gender.MALE,
    graveNumber: initialData?.graveNumber || suggestedGraveNumber || '',
    imageUrl: initialData?.imageUrl || '',
    notes: initialData?.notes || '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ageAtDeath, setAgeAtDeath] = useState<number>(initialData?.ageAtDeath || 0);

  // Manual trigger for age calculation if dates are changed manually
  useEffect(() => {
    if (formData.dateOfDeath && formData.dateOfBirth) {
      const birth = new Date(formData.dateOfBirth);
      const death = new Date(formData.dateOfDeath);
      if (!isNaN(birth.getTime()) && !isNaN(death.getTime())) {
        let age = death.getFullYear() - birth.getFullYear();
        if (death.getMonth() < birth.getMonth() || (death.getMonth() === birth.getMonth() && death.getDate() < birth.getDate())) {
          age--;
        }
        setAgeAtDeath(Math.max(0, age));
      }
    }
  }, [formData.dateOfBirth, formData.dateOfDeath]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanImage = async () => {
    if (!formData.imageUrl) return alert("براہ کرم پہلے تصویر اپ لوڈ کریں۔");
    setIsScanning(true);
    
    try {
      const base64Data = formData.imageUrl.split(',')[1];
      const mimeType = formData.imageUrl.split(';')[0].split(':')[1];
      const result = await extractGraveInfoFromImage(base64Data, mimeType);
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          deceasedFullName: result.deceasedFullName || prev.deceasedFullName,
          parentNames: result.parentNames || prev.parentNames,
          husbandName: result.husbandName || prev.husbandName,
          dateOfBirth: result.dateOfBirth || prev.dateOfBirth,
          dateOfDeath: result.dateOfDeath || prev.dateOfDeath,
          notes: result.notes ? `${prev.notes}\n\nخودکار معلومات: ${result.notes}`.trim() : prev.notes,
          gender: result.gender === 'Female' ? Gender.FEMALE : (result.gender === 'Male' ? Gender.MALE : prev.gender),
          // Only override grave number from scan if AI found something specific, otherwise keep suggestion
          graveNumber: result.graveNumber || prev.graveNumber 
        }));
        
        // If AI calculated or extracted the age, set it
        if (result.ageAtDeath !== undefined && result.ageAtDeath !== null) {
          setAgeAtDeath(result.ageAtDeath);
        }
      } else {
        alert("معلومات حاصل نہیں ہو سکیں۔ تصویر واضح نہیں ہے۔");
      }
    } catch (err) {
      alert("تصویر اسکین کرنے میں غلطی ہوئی۔");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!formData.deceasedFullName) return alert("براہ کرم پہلے نام درج کریں۔");
    setIsGenerating(true);
    const suggestion = await suggestNotes(formData.deceasedFullName);
    setFormData(prev => ({ ...prev, notes: suggestion }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = { ...formData };
    if (submissionData.gender !== Gender.FEMALE) {
      submissionData.husbandName = '';
    }
    onSave({ ...submissionData, ageAtDeath });
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400 text-right";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 justify-start";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12" dir="rtl">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={onCancel} className="p-2 bg-white border border-slate-200 rounded-full text-slate-600">
          <ArrowRight size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'ریکارڈ اپ ڈیٹ کریں' : 'نیا ریکارڈ شامل کریں'}</h2>
          <p className="text-sm text-slate-500">تاریخی ریکارڈ کے لیے درست معلومات درج کریں۔</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <label className={labelClass}><Camera size={14} /> قبر کی تصویر</label>
        
        {formData.imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden group border border-slate-200 aspect-[9/16] max-h-[400px] bg-slate-100 mx-auto">
            <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Grave" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white text-slate-700 rounded-full shadow-lg"
              >
                <Upload size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                className="p-3 bg-red-500 text-white rounded-full shadow-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-slate-50 mx-auto"
          >
            <Camera size={32} />
            <span className="font-semibold text-sm">تصویر لیں یا اپ لوڈ کریں</span>
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        {formData.imageUrl && (
          <button
            type="button"
            onClick={handleScanImage}
            disabled={isScanning}
            className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isScanning ? 'اردو تحریر پڑھی جا رہی ہے...' : 'تصویر سے معلومات حاصل کریں (اردو)'}
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className={labelClass}><User size={14} /> مکمل نام</label>
          <input
            required
            type="text"
            className={inputClass}
            value={formData.deceasedFullName}
            onChange={(e) => setFormData(prev => ({ ...prev, deceasedFullName: e.target.value }))}
            placeholder="مرحوم کا نام"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>جنس</label>
            <select
              className={inputClass}
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
            >
              <option value={Gender.MALE}>مرد</option>
              <option value={Gender.FEMALE}>عورت</option>
              <option value={Gender.OTHER}>دیگر</option>
            </select>
          </div>
          <div>
            <label className={labelClass}><Hash size={14} /> قبر کا نمبر</label>
            <input
              required
              type="text"
              className={inputClass}
              value={formData.graveNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, graveNumber: e.target.value }))}
              placeholder="مثلاً 104"
            />
            <p className="text-[10px] text-slate-400 mt-1 mr-1">یہ نمبر خودکار تجویز کیا گیا ہے، آپ تبدیل کر سکتے ہیں۔</p>
          </div>
        </div>

        {formData.gender === Gender.FEMALE && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <label className={labelClass}><Heart size={14} className="text-pink-500" /> شوہر کا نام</label>
            <input
              type="text"
              className={inputClass}
              value={formData.husbandName}
              onChange={(e) => setFormData(prev => ({ ...prev, husbandName: e.target.value }))}
              placeholder="شوہر کا مکمل نام"
            />
          </div>
        )}

        <div>
          <label className={labelClass}><User size={14} /> والدین کا نام</label>
          <input
            type="text"
            className={inputClass}
            value={formData.parentNames}
            onChange={(e) => setFormData(prev => ({ ...prev, parentNames: e.target.value }))}
            placeholder="والد یا والدہ کا نام"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Calendar size={14} /> پیدائش (ولادت)</label>
            <input
              type="date"
              className={inputClass}
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}><Calendar size={14} /> وفات</label>
            <input
              required
              type="date"
              className={inputClass}
              value={formData.dateOfDeath}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfDeath: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}><Info size={14} /> عمر (خودکار حاصل شدہ)</label>
          <div className="relative">
            <input
              type="number"
              className={`${inputClass} font-bold text-emerald-700 bg-emerald-50/50`}
              value={ageAtDeath}
              onChange={(e) => setAgeAtDeath(parseInt(e.target.value) || 0)}
              placeholder="عمر"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">سال</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 mr-1">اگر عمر درج نہیں تو ولادت اور وفات کی بنیاد پر خودکار حساب کیا جائے گا۔</p>
        </div>

        <div>
          <label className={labelClass}><Phone size={14} /> رشتہ دار کا رابطہ</label>
          <input
            type="tel"
            className={inputClass}
            value={formData.relativeContact}
            onChange={(e) => setFormData(prev => ({ ...prev, relativeContact: e.target.value }))}
            placeholder="فون نمبر"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>نوٹس / تفصیلات</label>
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isGenerating}
              className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Sparkles size={12} /> {isGenerating ? 'تیار ہو رہا ہے...' : 'AI سے تحریر تیار کریں'}
            </button>
          </div>
          <textarea
            className={`${inputClass} h-32 resize-none`}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="ذاتی تاریخ یا کوئی خاص تفصیل..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-700/20 active:scale-95 transition-transform"
        >
          {initialData ? 'تبدیلیاں محفوظ کریں' : 'ریکارڈ محفوظ کریں'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold active:scale-95 transition-transform"
        >
          منسوخ کریں
        </button>
      </div>
    </form>
  );
};

export default GraveForm;
