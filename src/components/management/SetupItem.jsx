import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Move, Edit3, Minus, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n';
import { panTypes, utensils } from '../mocks/setups';

export default React.memo(function SetupItem({
  item, index, total, onUpdate, onRemove, onClone, onDropIngredient, onReorder, isEditing, onToggleEdit,
}){
  const t = useI18n('en');
  const [editData, setEditData] = useState(item);
  const firstFieldRef = useRef(null);

  useEffect(() => { if (isEditing) firstFieldRef.current?.focus(); }, [isEditing]);
  useEffect(() => { setEditData(item); }, [item]);

  const handleSave = () => { onUpdate(index, editData); onToggleEdit(null); };
  const handleCancel = () => { setEditData(item); onToggleEdit(null); };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!e.dataTransfer.types?.includes('application/x-ingredient')) return;
    try { const ing = JSON.parse(e.dataTransfer.getData('application/x-ingredient')); onDropIngredient(index, ing); } catch {}
  };

  const getPanStyle = (pan) => [
    pan.includes('Deep') && 'border-b-4 border-gray-500',
    pan.includes('Narrow') && 'scale-x-90',
  ].filter(Boolean).join(' ');

  const handleReorder = (dir) => {
    if (dir==='up' && index>0) onReorder(index, index-1);
    if (dir==='down' && index<total-1) onReorder(index, index+1);
  };

  return (
    <motion.div
      className={`bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[180px] max-w-[220px] shadow-sm transition-shadow ${getPanStyle(item.pan)} ${isEditing ? 'border-blue-500' : 'hover:shadow-md'}`}
      style={{ minHeight: '200px' }}
      onDragOver={(e)=>e.preventDefault()} onDrop={handleDrop}
      role="group" aria-label={`Well ${index+1}: ${item.food}`} tabIndex={0}
      onKeyDown={(e)=>{ if((e.ctrlKey||e.metaKey)&&e.key==='ArrowUp'){e.preventDefault();handleReorder('up');} if((e.ctrlKey||e.metaKey)&&e.key==='ArrowDown'){e.preventDefault();handleReorder('down');} }}
    >
      <div className="flex justify-between items-start mb-2">
        <Move className="w-4 h-4 text-gray-400 cursor-grab" aria-hidden="true" />
        <div className="flex space-x-1">
          <button onClick={()=>handleReorder('up')} disabled={index===0} className="p-1 text-gray-500 hover:text-green-600 disabled:opacity-30" aria-label={t('moveUp')} title={t('moveUp')}>
            <ChevronUp className="w-3 h-3" aria-hidden="true" />
          </button>
          <button onClick={()=>handleReorder('down')} disabled={index===total-1} className="p-1 text-gray-500 hover:text-green-600 disabled:opacity-30" aria-label={t('moveDown')} title={t('moveDown')}>
            <ChevronDown className="w-3 h-3" aria-hidden="true" />
          </button>
          <button onClick={()=>onClone(index)} className="p-1 text-gray-500 hover:text-indigo-600" aria-label={t('clone')} title={t('clone')}>
            <Copy className="w-3 h-3" aria-hidden="true" />
          </button>
          <button onClick={()=>onToggleEdit(index)} className="p-1 text-gray-500 hover:text-blue-600" aria-label={isEditing?'Close editor':t('edit')} title={t('edit')}>
            <Edit3 className="w-3 h-3" aria-hidden="true" />
          </button>
          <button onClick={()=>onRemove(index)} className="p-1 text-gray-500 hover:text-red-600" aria-label={t('remove')} title={t('remove')}>
            <Minus className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">{t('food')}</label>
            <input type="text" ref={firstFieldRef} value={editData.food} onChange={(e)=>setEditData({...editData, food:e.target.value})} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">{t('temp')}</label>
            <select value={editData.temp} onChange={(e)=>setEditData({...editData, temp:e.target.value})} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
              <option value="Hot">Hot 🔥</option>
              <option value="Cold">Cold ❄️</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">{t('utensil')}</label>
            <select value={editData.utensil} onChange={(e)=>setEditData({...editData, utensil:e.target.value})} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
              {utensils.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">{t('pan')}</label>
            <select value={editData.pan} onChange={(e)=>setEditData({...editData, pan:e.target.value})} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
              {panTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">{t('save')}</button>
            <button onClick={handleCancel} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-3">
            <div className="text-lg font-bold text-gray-800 mb-1">{item.food}</div>
            <div className="text-sm text-gray-600">{item.utensil}</div>
          </div>
          <div className="bg-gray-100 rounded-md p-2 mb-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('pan')}</div>
            <div className="text-sm font-medium">{item.pan}</div>
          </div>
          <div className={`rounded-md p-2 ${item.temp==='Hot'?'bg-red-50':'bg-blue-50'}`}>
            <div className={`text-xs uppercase tracking-wide mb-1 ${item.temp==='Hot'?'text-red-600':'text-blue-600'}`}>{t('temp')}</div>
            <div className={`text-sm font-medium ${item.temp==='Hot'?'text-red-800':'text-blue-800'}`}>{item.temp==='Hot'?'🔥 Hot':'❄️ Cold'}</div>
            <button onClick={()=>onUpdate(index, { temp: item.temp==='Hot'?'Cold':'Hot' })} className="text-xs mt-1 text-gray-500 hover:text-gray-900 underline transition-colors" aria-label={t('toggleTemp')}>{t('toggleTemp')}</button>
          </div>
        </div>
      )}
    </motion.div>
  );
});