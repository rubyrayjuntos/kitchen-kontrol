/* global globalThis */
/* eslint-disable no-restricted-globals */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChefHat, Package, Save, Printer, Plus, Minus, RotateCcw, PlusCircle, Loader, Filter } from 'lucide-react';

import ErrorBoundary from './ErrorBoundary';
import SetupItem from './SetupItem';
import { useUndoRedoReducer } from '../hooks/useUndoRedoReducer';
import { useI18n } from '../i18n';

// util IDs
const newId = () => (globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`);

// reduced motion
const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
};

// wells reducer
function wellsReducer(state, action){
  switch (action.type) {
    case 'add': return [...state, { id: newId(), ...action.payload }];
    case 'update': { if (action.index<0||action.index>=state.length) return state; const next=[...state]; next[action.index]={...next[action.index], ...action.payload}; return next; }
    case 'remove': return state.filter((_,i)=>i!==action.index);
    case 'reorder': { const {from,to}=action; if(from===to||from<0||to<0||from>=state.length||to>=state.length) return state; const n=[...state]; const [d]=n.splice(from,1); n.splice(to,0,d); return n; }
    case 'clone': { if (action.index<0||action.index>=state.length) return state; return [...state, { ...state[action.index], id: newId(), food: `${state[action.index].food} (Copy)` }]; }
    default: return state;
  }
}

// fake API
const fetchSetupByDate = async (date) => {
  const res = await fetch(`/api/planograms/${date}`);
  const data = await res.json();
  return data.data;
};

// validation
const validateSetup = ({ title, wells }) => {
  if (!title) return 'Title is required';
  if (!Array.isArray(wells) || wells.length === 0) return 'Add at least one well';
  for (let i=0;i<wells.length;i++){
    const w = wells[i];
    if (!w.food) return `Well ${i+1} is missing a food item`;
    if (!['Hot','Cold'].includes(w.temp)) return `Well ${i+1} has invalid temperature`;
  }
  return null;
};

export default function PlanogramView(){
  const t = useI18n('en');
  const prefersReduced = useReducedMotion();
  const motionProps = prefersReduced ? { initial:false, animate:false } : { initial:{opacity:0, y:20}, animate:{opacity:1, y:0} };

  const [selectedDate, setSelectedDate] = useState(()=> new Date().toLocaleDateString('en-CA'));
  const [title, setTitle] = useState('New Meal');
  const [shotgun, setShotgun] = useState('No additional items yet.');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [planograms, setPlanograms] = useState([]);

  const [wells, dispatch, history] = useUndoRedoReducer(wellsReducer, []);

  // abortable loader
  useEffect(()=>{
    const ctrl = new AbortController();
    let alive = true;
    (async ()=>{
      try{
        setIsLoading(true);
        const [setup, ingredients, planograms] = await Promise.all([
            fetchSetupByDate(selectedDate),
            fetch("/api/ingredients").then(res => res.json()),
            fetch("/api/planograms").then(res => res.json()),
        ]);
        if (!alive) return;
        if (setup) {
            history.replace(setup.wells.map(w=>({ id: newId(), ...w })));
            setTitle(setup.title);
            setShotgun(setup.shotgun);
        } else {
            history.replace([]);
            setTitle('New Meal');
            setShotgun('No additional items yet.');
        }
        setIngredients(ingredients.data);
        setPlanograms(planograms.data);
      } catch(e){
        if (e.name !== 'AbortError') alert('Failed to load setup. Please try again.');
      } finally {
        alive && setIsLoading(false);
      }
    })();
    return ()=>{ alive=false; ctrl.abort(); };
  }, [selectedDate]);

  const saveSetup = async () => {
    const payload = { date: selectedDate, title, wells: wells.map(({id,...r})=>r), shotgun };
    const err = validateSetup(payload);
    if (err) return alert(err);
    try{
      setIsSaving(true);
      const planogramId = wells[0]?.planogram_id;
      const method = planogramId ? 'PUT' : 'POST';
      const url = planogramId ? `/api/planograms/${planogramId}` : '/api/planograms';
      await fetch(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      alert('Setup saved successfully!');
    } catch(e){
      alert('Error saving setup. Please retry.');
    } finally { setIsSaving(false); }
  };

  const printSetup = () => {
    const wellText = wells.map((w,i)=>`Well ${i+1}: ${w.temp} | ${w.pan} | ${w.food} | ${w.utensil}`).join('\n');
    const html = `<!doctype html><html><head><title>${title} Setup - ${selectedDate}</title>
      <style>body{font-family:sans-serif;padding:20px}h1{border-bottom:1px solid #ccc;padding-bottom:10px}pre{font-family:ui-monospace,Menlo,Consolas,monospace;padding:10px;background:#f4f4f4;border:1px solid #eee;white-space:pre-wrap}</style>
      </head><body><h1>${title} Setup - ${selectedDate}</h1><h2>Service Line Wells</h2><pre>${wellText}</pre><h2>Shotgun Area</h2><p>${shotgun}</p>
      <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300)}<\/script><\/body><\/html>`;
    const win = window.open('', 'Print', 'width=800,height=900');
    if (!win) return alert('Please allow pop-ups to print.');
    win.document.write(html); win.document.close();
  };

  // Inventory state (kept local here; undo history is for wells only)
  const [ingredients, setIngredients] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredIngredients = useMemo(()=>{
    return ingredients.filter(item => {
      if (filter==='low') return item.quantity < item.minStock;
      if (filter==='all') return true;
      return item.category === filter;
    });
  }, [ingredients, filter]);

  const updateQuantity = (id, change) => setIngredients(prev => prev.map(it => it.id===id ? {...it, quantity: Math.max(0, it.quantity + change)} : it));
  const updateMinStock = (id, v) => setIngredients(prev => prev.map(it => it.id===id ? {...it, minStock: Math.max(0, v)} : it));
  const resetTally = () => { if (confirm('Reset all inventory quantities to 2x minStock?')) setIngredients(prev => prev.map(it => ({...it, quantity: it.minStock*2}))); };
  const handleAddNewIngredient = () => {
    const name = prompt('New item name?');
    if (!name) return;
    setIngredients(prev => [...prev, { id: Date.now(), name, unit:'pcs', category: 'other', minStock:5, quantity:0 }]);
  };

  // DnD: Inventory -> Wells
  const handleDragStartIngredient = (e, ing) => {
    e.dataTransfer.setData('application/x-ingredient', JSON.stringify(ing));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropIngredient = useCallback((index, ingredient) => {
    const utensil = (ingredient.category==='meat' || ingredient.category==='bread') ? 'Tongs' : 'Scoop';
    dispatch({ type: 'update', index, payload: { food: ingredient.name, utensil } });
  }, [dispatch]);

  // Reorder helper passes SR msg through action
  const onReorder = useCallback((from, to, onAnnounce) => {
    dispatch({ type:'reorder', from, to, onReorder:onAnnounce });
  }, [dispatch]);

  // UI blocks ----------------- 
  const today = useMemo(()=> new Date().toLocaleDateString('en-CA'), []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kitchen Management Dashboard</h1>
          <p className="text-gray-600">Plan your daily meal setups and manage inventory</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="md:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <label htmlFor="datePicker" className="text-sm font-medium text-gray-700 block mb-2">Select Date</label>
              <input id="datePicker" type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4">
              <input type="text" placeholder="Search setups..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Search setups" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center mb-4"><Calendar className="w-5 h-5 text-gray-600 mr-2" /><h3 className="text-lg font-semibold text-gray-800">Planned Days</h3></div>
              <div className="space-y-2" role="list" aria-label="Planned day setups">
                {planograms.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.date.includes(searchTerm)).map(setup => {
                  const isSelected = selectedDate === setup.date; const isToday = setup.date === today;
                  return (
                    <button key={setup.date} onClick={()=>setSelectedDate(setup.date)} className={`w-full text-left p-3 rounded-lg border transition-colors relative ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`} role="listitem" aria-current={isSelected ? 'date' : undefined}>
                      <div className="font-medium">{setup.title}</div><div className="text-sm opacity-75">{setup.date}</div>
                      {isToday && <span className="absolute top-2 right-2 text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">{t('today')}</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Panel */}
          <div className="md:col-span-2 lg:col-span-2">
            <ErrorBoundary>
              <motion.div {...motionProps} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12 text-lg text-gray-500" role="status" aria-live="polite">
                    <Loader className="w-6 h-6 animate-spin mr-3" /> {t('loading')}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center"><ChefHat className="w-6 h-6 text-gray-600 mr-2" /><h2 className="text-xl font-semibold text-gray-800">{title} Setup</h2></div>
                      <div className="flex space-x-2">
                        <button onClick={saveSetup} disabled={isSaving} aria-busy={isSaving} aria-disabled={isSaving} className={`flex items-center px-3 py-2 text-white rounded-lg transition-colors text-sm ${isSaving?'bg-blue-400 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700'}`}>
                          {isSaving ? <Loader className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                          {isSaving ? t('saving') : t('save')}
                        </button>
                        <button onClick={printSetup} className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"><Printer className="w-4 h-4 mr-1" />{t('print')}</button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="titleSelect" className="text-sm font-medium text-gray-700 block mb-2">{t('title')}</label>
                      <select id="titleSelect" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Fruit</option><option>New Meal</option>
                      </select>
                    </div>

                    {/* Visual Builder */}
                    <VisualSetupBuilder
                      wells={wells} dispatch={dispatch} history={history}
                      shotgun={shotgun} setShotgun={setShotgun}
                      onDropIngredient={handleDropIngredient}
                      editingIndex={editingIndex} setEditingIndex={setEditingIndex}
                    />

                    {/* Quick Settings */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-medium text-gray-800">{t('quickSettings')}</h3></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wells.map((w,i)=> (
                          <div key={w.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-2">Item {i+1}: {w.food || 'Unnamed'}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                              <div><span role="img" aria-label="utensil">🍴</span> <strong>Utensil:</strong> {w.utensil}</div>
                              <div><span role="img" aria-label="pan">🥘</span> <strong>Pan:</strong> {w.pan}</div>
                              <div className="col-span-2">{w.temp==='Hot' ? (<><span role="img" aria-label="hot">🔥</span> <strong>Hot</strong></>) : (<><span role="img" aria-label="cold">❄️</span> <strong>Cold</strong></>)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </ErrorBoundary>
          </div>

          {/* Right Panel: Inventory */}
          <div className="md:col-span-1 lg:col-span-1">
            <ErrorBoundary>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center"><Package className="w-5 h-5 text-gray-600 mr-2" /><h3 className="text-lg font-semibold text-gray-800">Inventory</h3></div>
                  <div className="flex space-x-2">
                    <button onClick={()=>setShowFilters(s=>!s)} className={`p-1 ${showFilters?'text-blue-600':'text-gray-500 hover:text-blue-600'}`} title="Filter Inventory"><Filter className="w-4 h-4" /></button>
                    <button onClick={resetTally} className="p-1 text-gray-500 hover:text-blue-600" title="Reset Tally" aria-label="Reset Tally"><RotateCcw className="w-4 h-4" /></button>
                    <button onClick={()=>setShowAddForm(s=>!s)} className={`p-1 ${showAddForm?'text-blue-600':'text-gray-500 hover:text-blue-600'}`} title="Add New" aria-label="Add New"><PlusCircle className="w-4 h-4" /></button>
                  </div>
                </div>

                {showFilters && (
                  <div className="p-3 mb-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <div className="flex space-x-2 text-sm">
                      {['all','low','meat','produce'].map(f => (
                        <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full font-medium ${filter===f?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-100'}`}>
                          {f==='all'?'All': f==='low'?'Low Stock' : f[0].toUpperCase()+f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showAddForm && (
                  <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
                    <button onClick={handleAddNewIngredient} className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700">Add</button>
                  </div>
                )}

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredIngredients.map(item => {
                    const isLow = item.quantity < item.minStock;
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg transition-all ${isLow?'bg-red-50 border border-red-300 shadow-sm':'bg-gray-50'}`} draggable onDragStart={(e)=>handleDragStartIngredient(e, item)} title={isLow?`Low Stock: Below ${item.minStock} ${item.unit}`: ''} aria-label={`${item.name} — ${item.quantity} ${item.unit}${isLow?', Low Stock':''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium text-sm truncate ${isLow?'text-red-800':'text-gray-800'}`}>{item.name}{isLow && <span className="ml-1">⚠️</span>}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.category==='meat'?'bg-red-100 text-red-800': item.category==='produce'?'bg-green-100 text-green-800': item.category==='fruit'?'bg-orange-100 text-orange-800': item.category==='bread'?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-800'}`}>{item.category}</span>
                          </div>
                          <div className="text-xs text-gray-600">{item.quantity} {item.unit}</div>
                        </div>
                        <div className="flex items-center ml-3 space-x-2">
                          <input type="number" min={0} value={item.minStock} onChange={(e)=>updateMinStock(item.id, Number(e.target.value))} className="w-10 text-xs text-center border rounded" title="Min Stock Threshold" />
                          <button onClick={()=>updateQuantity(item.id, -1)} className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50" disabled={item.quantity===0} aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span className="mx-2 font-medium text-sm min-w-[30px] text-center" aria-live="polite">{item.quantity}</span>
                          <button onClick={()=>updateQuantity(item.id, 1)} className="p-1 text-green-600 hover:bg-green-100 rounded" aria-label={`Increase ${item.name} quantity`}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualSetupBuilder({ wells, dispatch, history, shotgun, setShotgun, onDropIngredient, editingIndex, setEditingIndex }){
  const t = useI18n('en');
  const prefersReduced = useReducedMotion();
  const motionProps = prefersReduced ? { initial:false, animate:false } : { initial:{opacity:0, y:20}, animate:{opacity:1, y:0} };
  const dragTypeWell = 'application/x-well-index';
  const [srMsg, setSrMsg] = useState('');

  const handleDragStart = (e, index) => { e.dataTransfer.setData(dragTypeWell, String(index)); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!e.dataTransfer.types?.includes(dragTypeWell)) return;
    const dragIndex = parseInt(e.dataTransfer.getData(dragTypeWell), 10);
    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;
    dispatch({ type:'reorder', from: dragIndex, to: dropIndex, onReorder:(f,t)=>setSrMsg(t('moveItem',{from:f+1,to:t+1})) });
  };
  const updateWell = (index, payload) => dispatch({ type:'update', index, payload });
  const removeWell = (index) => { dispatch({ type:'remove', index }); setEditingIndex(null); };
  const cloneWell = (index) => dispatch({ type:'clone', index });
  const addWell = () => dispatch({ type:'add', payload: { temp:'Hot', pan:'Full Shallow', food:'New Item', utensil:'Spoodle' } });

  const { undo, redo, canUndo, canRedo } = history;

  return (
    <motion.div {...motionProps} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Visual Service Line</h3>
        <div className="flex space-x-2">
          <button onClick={undo} disabled={!canUndo} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm" title={t('undo')} aria-label={t('undo')}>{t('undo')}</button>
          <button onClick={redo} disabled={!canRedo} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm" title={t('redo')} aria-label={t('redo')}>{t('redo')}</button>
          <button onClick={addWell} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">+ {t('add')}</button>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">{srMsg}</div>

      <div className="mb-6" role="list" aria-label="Service line wells">
        <div className="flex items-center mb-3">
          <div className="w-full h-0.5 bg-gray-300 relative">
            <div className="absolute left-0 -top-2 text-xs text-gray-500">{t('serviceStart')}</div>
            <div className="absolute right-0 -top-2 text-xs text-gray-500">{t('serviceEnd')}</div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {wells.map((well, index) => (
            <motion.div key={well.id} draggable onDragStart={(e)=>handleDragStart(e,index)} onDragOver={handleDragOver} onDrop={(e)=>handleDrop(e,index)} className="flex-shrink-0">
              <SetupItem item={well} index={index} total={wells.length} onUpdate={updateWell} onRemove={removeWell} onClone={cloneWell} onReorder={(f,t)=>dispatch({type:'reorder', from:f, to:t, onReorder:(ff,tt)=>setSrMsg(t('moveItem',{from:ff+1,to:tt+1}))})} isEditing={editingIndex===index} onToggleEdit={setEditingIndex} onDropIngredient={onDropIngredient} />
            </motion.div>
          ))}
          {wells.length===0 && (
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">Click “Add Item” or <span className="mx-1 font-semibold">Drag & Drop</span> an ingredient from the right!</div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-800 mb-2">Shotgun Area (Additional Items)</h4>
        <textarea value={shotgun} onChange={(e)=>setShotgun(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={2} placeholder="Extra fruit, condiments, backup items, etc." />
      </div>
    </motion.div>
  );
}
