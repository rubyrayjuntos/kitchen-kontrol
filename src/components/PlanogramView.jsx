import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Flame,
  Snowflake,
  FileText,
  Undo2,
  Redo2,
  Plus,
  Copy,
  Trash2,
  Droplets,
  Box,
  Save,
  ThermometerSun,
  ThermometerSnowflake,
  AlertCircle,
} from "lucide-react";
import useStore from "../store";

const PAN_GROUPS = [
  {
    title: "Full Size",
    items: [
      { id: "full-shallow", name: "Full Shallow", size: "full", depth: "shallow", material: "metal" },
      { id: "full-deep", name: "Full Deep", size: "full", depth: "deep", material: "metal" },
    ],
  },
  {
    title: "Half Size",
    items: [
      { id: "half-shallow-metal", name: "Half Shallow Metal", size: "half", depth: "shallow", material: "metal" },
      { id: "half-shallow-plastic", name: "Half Shallow Plastic", size: "half", depth: "shallow", material: "plastic" },
      { id: "half-deep-metal", name: "Half Deep Metal", size: "half", depth: "deep", material: "metal" },
      { id: "half-deep-plastic", name: "Half Deep Plastic", size: "half", depth: "deep", material: "plastic" },
    ],
  },
];

const UTENSILS = [
  { id: "spoodle-no-holes", name: "Spoodle" },
  { id: "spoodle-holes", name: "Slotted Spoodle" },
  { id: "tongs", name: "Tongs" },
];

const defaultWells = [
  { id: 1, isHot: true, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] },
  { id: 2, isHot: true, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] },
  { id: 3, isHot: true, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] },
  { id: 4, isHot: true, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] },
];

const PDFModal = React.memo(function PDFModal({ onClose, wells, pdfNotes, setPdfNotes, pdfCompact, setPdfCompact, getPanColor, gridCols }) {
  const modalRef = useRef(null);
  const firstFocusable = useRef(null);
  const notesTextareaRef = useRef(null);

  useEffect(() => {
    const prevActive = document.activeElement;
    firstFocusable.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "Tab" && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prevActive?.focus(); };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="swp-pdf-title" className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={modalRef} className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-screen overflow-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h2 id="swp-pdf-title" className="text-2xl font-bold text-slate-800">Steamer Well Layout</h2>
            <p className="text-slate-600 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button ref={firstFocusable} onClick={() => setPdfCompact(!pdfCompact)} className="px-3 py-2 border border-slate-300 rounded" aria-pressed={pdfCompact}>
              {pdfCompact ? "Compact: On" : "Compact: Off"}
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText size={18} /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Close</button>
          </div>
        </div>

        <div id="pdf-content" className={`p-6 ${pdfCompact ? "text-sm" : "text-base"}`}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (shown on PDF)</label>
            <textarea ref={notesTextareaRef} value={pdfNotes} onChange={(e) => setPdfNotes(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded resize-none" placeholder="Allergens, rotation, prep notes…" />
          </div>

          <div className={`grid ${gridCols} gap-4`}>
            {wells.map((well) => (
              <div key={well.id} className="border-2 border-slate-300 rounded-lg p-3 bg-white break-inside-avoid">
                <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
                  <h3 className="text-xl font-bold text-slate-700">Well {well.id}</h3>
                  <div className={`px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-1 ${well.isHot ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}>
                    {well.isHot ? <Flame size={16} /> : <Snowflake size={16} />}
                    {well.isHot ? "Hot" : "Cold"}
                  </div>
                </div>

                {!!well.topLabel && (
                  <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{well.topLabel}</p>
                  </div>
                )}

                <div className={`rounded-lg p-3 mb-2 relative border-2 ${well.isHot ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50"}`}>
                  <div className="relative h-40 w-28">
                    {(() => {
                      const full = well.pans.find(p => p.size === "full");
                      if (full) {
                        return (
                          <div className={`absolute inset-0 rounded ${getPanColor(full)} p-2 text-xs font-medium text-white shadow`}>
                            <div className="h-full flex flex-col">
                              <div className="text-center font-semibold mb-1">{full.name}</div>
                              {full.foodLabel && (
                                <div className="flex-1 bg-white/90 text-slate-800 rounded px-2 py-1 text-xs font-semibold flex items-center justify-center">{full.foodLabel}</div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      const halves = well.pans.filter(p => p.size === "half");
                      return ["top-0", "bottom-0"].map((pos, i) => {
                        const pan = halves[i];
                        if (!pan) return (<div key={i} className={`absolute left-0 right-0 h-1/2 ${pos} flex items-center justify-center text-slate-400 text-xs`}>Empty slot</div>);
                        return (
                          <div key={pan.uniqueId} className={`absolute left-0 right-0 h-1/2 ${pos} rounded ${getPanColor(pan)} p-2 text-xs font-medium text-white shadow`}>
                            <div className="h-full flex flex-col">
                              <div className="text-center font-semibold mb-1">{pan.name}</div>
                              {pan.foodLabel && (
                                <div className="flex-1 bg-white/90 text-slate-800 rounded px-2 py-1 text-xs font-semibold flex items-center justify-center">{pan.foodLabel}</div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {!!well.middleLabel && (
                  <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{well.middleLabel}</p>
                  </div>
                )}

                {well.utensils.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded border border-slate-200 mb-2">
                    {well.utensils.map(u => (
                      <div key={u.uniqueId} className="bg-amber-400 px-2 py-1 rounded-full text-xs font-medium text-amber-900">{u.name}</div>
                    ))}
                  </div>
                )}

                {!!well.bottomLabel && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{well.bottomLabel}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-center gap-3">
          <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Print / Save as PDF</button>
          <button onClick={onClose} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
});

// Simple external legend component
const WellLegend = () => (
  <div className="flex items-center gap-3 text-xs text-slate-600">
    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-500 inline-block" /> full</span>
    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-600 inline-block" /> metal half</span>
    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> plastic half</span>
    <span className="inline-flex items-center gap-1"><Droplets size={14} /> hot/cold frame</span>
  </div>
);


// Safer uid with crypto fallback
const uid = () => {
  if (typeof crypto !== "undefined" && (crypto).randomUUID) {
    return (crypto).randomUUID();
  }
  const c = ((uid)._c = ((uid)._c ?? 0) + 1);
  return `id_${Date.now()}_${c}_${Math.random().toString(36).slice(2, 8)}`;
};

/** ---------- Component ---------- */
const PlanogramView = () => {
  const {
    planograms,
    selectedPlanogram,
    fetchPlanograms,
    fetchPlanogramByDate,
    savePlanogram,
  } = useStore();

  const [wells, setWells] = useState(defaultWells);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverWell, setDragOverWell] = useState(null);

  const [showPDF, setShowPDF] = useState(false);
  const [pdfNotes, setPdfNotes] = useState("");
  const [pdfCompact, setPdfCompact] = useState(false);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchPlanogramByDate(selectedDate);
  }, [selectedDate, fetchPlanogramByDate]);

  useEffect(() => {
    if (selectedPlanogram) {
      setWells(selectedPlanogram.wells);
      setPdfNotes(selectedPlanogram.notes || "");
      setPdfCompact(selectedPlanogram.compactPDF || false);
    } else {
      setWells(defaultWells);
      setPdfNotes("");
      setPdfCompact(false);
    }
  }, [selectedPlanogram]);


  // Print CSS for CRA/Vite (non-Next)
  useEffect(() => {
    const node = document.createElement("style");
    node.setAttribute("data-swp-print", "1");
    node.textContent = `
      @media print {
        body * { visibility: hidden; }
        #pdf-content, #pdf-content * { visibility: visible; }
        #pdf-content { position: absolute; left: 0; top: 0; width: 100%; }
        @page { margin: 12mm; }
      }
    `;
    document.head.appendChild(node);
    return () => { document.head.removeChild(node); };
  }, []);

  // Keyboard shortcuts: undo/redo outside inputs; Esc closes modal
  useEffect(() => {
    const handler = (e) => {
      const inField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      const mod = e.metaKey || e.ctrlKey;
      if (!inField && mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if (e.key === "Escape" && showPDF) {
        e.preventDefault();
        setShowPDF(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showPDF]);

    // Global drag cleanup
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverWell(null);
  }, []);

  useEffect(() => {
    const onWindowDragEnd = () => handleDragEnd();
    window.addEventListener("dragend", onWindowDragEnd);
    window.addEventListener("drop", onWindowDragEnd);
    return () => {
      window.removeEventListener("dragend", onWindowDragEnd);
      window.removeEventListener("drop", onWindowDragEnd);
    };
  }, [handleDragEnd]);

  // Debounced text edit session (single undo step for many keystrokes)
  const debounced = useRef({ active: false, timer: null });
  const commitTextChange = useCallback((updater) => {
    setWells(prev => {
      const next = updater(prev);
      if (!debounced.current.active) {
        setPast(p => [...p, prev]);
        setFuture([]);
        debounced.current.active = true;
      }
      if (debounced.current.timer) window.clearTimeout(debounced.current.timer);
      debounced.current.timer = window.setTimeout(() => {
        debounced.current.active = false;
        debounced.current.timer = null;
      }, 500);
      return next;
    });
  }, []);

  // History helpers (for discrete actions)
  const commit = useCallback((nextState) => {
    setPast(p => [...p, wells]);
    setFuture([]);
    setWells(nextState);
  }, [wells]);

  const undo = React.useCallback(() => {
    setPast(prevPast => {
      if (!prevPast.length) return prevPast;
      const prev = prevPast[prevPast.length - 1];
      setWells(curr => {
        setFuture(f => [curr, ...f]);
        return prev;
      });
      return prevPast.slice(0, -1);
    });
  }, [past]);

  const redo = React.useCallback(() => {
    setFuture(prevFuture => {
      if (!prevFuture.length) return prevFuture;
      const next = prevFuture[0];
      setWells(curr => {
        setPast(p => [...p, curr]);
        return next;
      });
      return prevFuture.slice(1);
    });
  }, [future]);

  // ---------- Core Logic ----------
  const getPanColor = useCallback((pan) => {
    if (pan.size === "full") return "bg-slate-500";
    if (pan.material === "metal") return "bg-gray-600";
    return "bg-blue-400";
  }, []);

  const canPlacePan = useCallback((well, pan) => {
    const existing = well.pans;
    if (existing.some(p => p.size === "full")) return false;
    if (pan.size === "full") return existing.length === 0;
    const halfCount = existing.filter(p => p.size === "half").length;
    if (pan.size === "half") return halfCount < 2;
    return false;
  }, []);

  const handleDragStart = useCallback((item, type) => {
    setDraggedItem({ ...item, type });
  }, []);

  const handleDragOver = useCallback((e, wellId) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.type === "pan") {
      const well = wells.find(w => w.id === wellId);
      if (well) setDragOverWell({ id: wellId, canDrop: canPlacePan(well, draggedItem) });
    } else {
      setDragOverWell({ id: wellId, canDrop: true });
    }
  }, [draggedItem, wells, canPlacePan]);

  const handleDrop = useCallback((e, wellId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem?.type === "pan") {
      const well = wells.find(w => w.id === wellId);
      if (well && canPlacePan(well, draggedItem)) {
        placePan(wellId, draggedItem);
      }
    } else if (draggedItem?.type === "utensil") {
      placeUtensil(wellId, draggedItem);
    }
    setDragOverWell(null);
    setDraggedItem(null);
  }, [draggedItem, wells, canPlacePan]);

  const placePan = useCallback((wellId, pan) => {
    commit(
      wells.map(well => {
        if (well.id !== wellId || !canPlacePan(well, pan)) return well;
        const newPan = { ...pan, uniqueId: uid(), foodLabel: "" };
        if (pan.size === "full") return { ...well, pans: [newPan] };
        return { ...well, pans: [...well.pans, newPan] };
      })
    );
  }, [commit, wells, canPlacePan]);

  const placeUtensil = useCallback((wellId, utensil) => {
    commit(
      wells.map(well => {
        if (well.id !== wellId) return well;
        return { ...well, utensils: [...well.utensils, { ...utensil, uniqueId: uid() }] };
      })
    );
  }, [commit, wells]);

  const removeItem = useCallback((wellId, itemId, itemType) => {
    commit(
      wells.map(well => {
        if (well.id !== wellId) return well;
        if (itemType === "pan") return { ...well, pans: well.pans.filter(p => p.uniqueId !== itemId) };
        return { ...well, utensils: well.utensils.filter(u => u.uniqueId !== itemId) };
      })
    );
  }, [commit, wells]);

  const toggleTemp = useCallback((wellId) => {
    commit(wells.map(w => (w.id === wellId ? { ...w, isHot: !w.isHot } : w)));
  }, [commit, wells]);

  const updateLabel = useCallback((wellId, position, value) => {
    commitTextChange(prev => prev.map(w => (w.id === wellId ? { ...w, [`${position}Label`]: value } : w)));
  }, [commitTextChange]);

  const updatePanFood = useCallback((wellId, panId, value) => {
    commitTextChange(prev => prev.map(w => {
      if (w.id !== wellId) return w;
      return { ...w, pans: w.pans.map(p => (p.uniqueId === panId ? { ...p, foodLabel: value } : p)) };
    }));
  }, [commitTextChange]);

  // ---------- Well & Layout Management ----------
  const addWell = useCallback(() => {
    const nextId = wells.length ? Math.max(...wells.map(w => w.id)) + 1 : 1;
    commit([...wells, { id: nextId, isHot: true, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] }]);
  }, [commit, wells]);

  const duplicateWell = useCallback((wellId) => {
    const src = wells.find(w => w.id === wellId);
    if (!src) return;
    const nextId = Math.max(...wells.map(w => w.id)) + 1;
    const clone = {
      ...src,
      id: nextId,
      pans: src.pans.map(p => ({ ...p, uniqueId: uid() })),
      utensils: src.utensils.map(u => ({ ...u, uniqueId: uid() })),
    };
    commit([...wells, clone]);
  }, [commit, wells]);

  const clearWell = useCallback((wellId) => {
    commit(wells.map(w => (w.id === wellId ? { ...w, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] } : w)));
  }, [commit, wells]);

  const removeWell = useCallback((wellId) => {
    if (wells.length <= 1) return;
    if (!window.confirm("Remove this well?")) return;
    commit(wells.filter(w => w.id !== wellId));
  }, [commit, wells]);

  const clearAll = useCallback(() => {
    if (window.confirm("Clear all labels, pans, and utensils from all wells?")) {
      commit(wells.map(w => ({ ...w, topLabel: "", middleLabel: "", bottomLabel: "", pans: [], utensils: [] })));
    }
  }, [commit, wells]);

  const toggleAllTemps = useCallback((hot) => {
    commit(wells.map(w => ({ ...w, isHot: hot })));
  }, [commit, wells]);

  const handleSavePlanogram = () => {
    const planogram = {
        id: selectedPlanogram?.id,
        date: selectedDate,
        title: "My Planogram", // You might want to have a title input
        notes: pdfNotes,
        compactPDF: pdfCompact,
        wells: wells,
    };
    savePlanogram(planogram);
  };

  // ---------- PDF ----------
  const gridCols = useMemo(() => {
    const n = wells.length;
    if (n <= 2) return "grid-cols-2";
    if (n === 3) return "grid-cols-3";
    if (n === 4) return "grid-cols-4";
    if (n === 5) return "grid-cols-5";
    return "grid-cols-4 lg:grid-cols-6";
  }, [wells.length]);

  /** ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-slate-800">Steamer Well Planner</h1>

          <div className="flex flex-wrap gap-2">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <button onClick={undo} disabled={!past.length} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 flex items-center gap-2">
              <Undo2 size={18} /> Undo
            </button>
            <button onClick={redo} disabled={!future.length} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 flex items-center gap-2">
              <Redo2 size={18} /> Redo
            </button>

            <button onClick={() => toggleAllTemps(true)} className="px-3 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
              <ThermometerSun size={18} /> All Hot
            </button>
            <button onClick={() => toggleAllTemps(false)} className="px-3 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <ThermometerSnowflake size={18} /> All Cold
            </button>

            <button onClick={clearAll} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-2">
              <Trash2 size={18} /> Clear All
            </button>

            <button onClick={() => setShowPDF(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow">
              <FileText size={18} /> PDF
            </button>

            <button onClick={handleSavePlanogram} className="px-3 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Save size={16} /> Save Planogram
            </button>
          </div>
        </div>

        {/* Catalog */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-slate-700 flex items-center gap-2">
            <Box size={18} /> Pans
          </h2>

          <div className="grid gap-4">
            {PAN_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="text-sm font-semibold text-slate-600 mb-2">{group.title}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {group.items.map((pan) => (
                    <div
                      key={pan.id}
                      draggable
                      onDragStart={() => handleDragStart(pan, "pan")}
                      onDragEnd={handleDragEnd}
                      className="bg-gradient-to-br from-slate-300 to-slate-400 p-3 rounded-lg cursor-move text-center text-sm font-medium text-slate-800 shadow active:scale-95 transition-transform"
                      aria-label={`Drag ${pan.name}`}
                      title={`Drag ${pan.name}`}
                    >
                      {pan.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-slate-700">Utensils</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {UTENSILS.map((u) => (
              <div
                key={u.id}
                draggable
                onDragStart={() => handleDragStart(u, "utensil")}
                onDragEnd={handleDragEnd}
                className="bg-gradient-to-br from-amber-300 to-amber-400 p-3 rounded-lg cursor-move text-center text-sm font-medium text-amber-900 shadow active:scale-95 transition-transform"
                aria-label={`Drag ${u.name}`}
                title={`Drag ${u.name}`}
              >
                {u.name}
              </div>
            ))}
          </div>
        </div>

        {/* Wells header */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600">Tip: Drag & drop, or use the “Add” menus inside each well.</div>
          <button onClick={addWell} className="px-3 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus size={18} /> Add Well
          </button>
        </div>

        {/* Wells grid */}
        <div className="flex overflow-x-auto gap-4 p-4">
          {wells.map((well) => {
            const isOver = dragOverWell?.id === well.id;
            const dropOK = dragOverWell?.canDrop;
            return (
              <div key={well.id} className="bg-white rounded-lg shadow-lg p-4 border border-slate-200 w-64 flex-shrink-0">
                <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-slate-700">Well {well.id}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => toggleTemp(well.id)} className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${well.isHot ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                      {well.isHot ? <Flame size={18} /> : <Snowflake size={18} />}
                      {well.isHot ? "Hot" : "Cold"}
                    </button>
                    <button onClick={() => duplicateWell(well.id)} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-2">
                      <Copy size={18} /> Duplicate
                    </button>
                    <button onClick={() => clearWell(well.id)} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200">
                      Clear
                    </button>
                    <button onClick={() => removeWell(well.id)} disabled={wells.length <= 1} className="px-3 py-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 flex items-center gap-2">
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                </div>

                <input type="text" placeholder="Top label" value={well.topLabel} onChange={(e) => updateLabel(well.id, "top", e.target.value)} className="w-full p-2 mb-2 border border-slate-300 rounded text-sm" />

                {/* Pans area */}
                <div onDragOver={(e) => handleDragOver(e, well.id)} onDrop={(e) => handleDrop(e, well.id)} className={`min-h-32 border-4 border-dashed rounded-lg p-3 mb-2 relative transition-all ${well.isHot ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50"} ${isOver ? (dropOK ? "ring-4 ring-emerald-300" : "ring-4 ring-red-300") : ""}`}>
                  {/* No-drag add menu */}
                  <details className="mb-2">
                    <summary className="text-xs cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-white/80 rounded border border-slate-200">
                      <Plus size={14} /> Add Pan
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PAN_GROUPS.flatMap(g => g.items).map(p => (
                        <button
                          key={p.id}
                          onClick={(e) => { e.preventDefault(); if (canPlacePan(well, p)) placePan(well.id, p); }}
                          className={`text-left px-2 py-1 rounded text-xs border ${canPlacePan(well, p) ? "bg-slate-100 hover:bg-slate-200 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"}`}
                          title={canPlacePan(well, p) ? `Add ${p.name}` : "Slot rules prevent this pan"}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </details>

                  {/* Slots */}
                  <div className="relative h-40">
                    {(() => {
                      const full = well.pans.find(p => p.size === "full");
                      if (full) {
                        return (
                          <div className={`absolute inset-0 rounded ${getPanColor(full)} p-2 text-xs font-medium text-white shadow-lg`}>
                            <div className="flex flex-col h-full">
                              <div className="text-center mb-1">{full.name}</div>
                              <input type="text" placeholder="Food item..." value={full.foodLabel} onChange={(e) => updatePanFood(well.id, full.uniqueId, e.target.value)} className="flex-1 bg-white/90 text-slate-800 rounded px-2 py-1 text-xs border-none outline-none" />
                            </div>
                            <button aria-label="Remove pan" onClick={() => removeItem(well.id, full.uniqueId, "pan")} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700">×</button>
                          </div>
                        );
                      }
                      const halves = well.pans.filter(p => p.size === "half");
                      return ["top-0", "bottom-0"].map((pos, i) => {
                        const pan = halves[i];
                        if (!pan) return (<div key={i} className={`absolute left-0 right-0 h-1/2 ${pos} flex items-center justify-center text-slate-400 text-sm`}>Empty slot</div>);
                        return (
                          <div key={pan.uniqueId} className={`absolute left-0 right-0 h-1/2 ${pos} rounded ${getPanColor(pan)} p-2 text-xs font-medium text-white shadow-lg`}>
                            <div className="flex flex-col h-full">
                              <div className="text-center mb-1">{pan.name}</div>
                              <input type="text" placeholder="Food item..." value={pan.foodLabel} onChange={(e) => updatePanFood(well.id, pan.uniqueId, e.target.value)} className="flex-1 bg-white/90 text-slate-800 rounded px-2 py-1 text-xs border-none outline-none" />
                            </div>
                            <button aria-label="Remove pan" onClick={() => removeItem(well.id, pan.uniqueId, "pan")} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700">×</button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <input type="text" placeholder="Middle label" value={well.middleLabel} onChange={(e) => updateLabel(well.id, "middle", e.target.value)} className="w-full p-2 mb-2 border border-slate-300 rounded text-sm" />

                {/* Utensils */}
                <div onDragOver={(e) => handleDragOver(e, well.id)} onDrop={(e) => handleDrop(e, well.id)} className={`flex flex-wrap gap-2 min-h-12 p-2 bg-slate-50 rounded border border-slate-200 ${dragOverWell?.id === well.id ? (dragOverWell?.canDrop ? "ring-2 ring-emerald-300" : "ring-2 ring-red-300") : ""}`}>
                  {well.utensils.length === 0 && <span className="text-slate-400 text-sm">Drop utensils here</span>}
                  {well.utensils.map(u => (
                    <div key={u.uniqueId} className="bg-amber-400 px-3 py-1 rounded-full text-xs font-medium text-amber-900 flex items-center gap-2">
                      {u.name}
                      <button aria-label={`Remove ${u.name}`} onClick={() => removeItem(well.id, u.uniqueId, "utensil")} className="bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold hover:bg-red-700">×</button>
                    </div>
                  ))}
                </div>

                {/* No-drag add for utensils */}
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200">
                    <Plus size={14} /> Add Utensil
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {UTENSILS.map(u => (
                      <button key={u.id} onClick={(e) => { e.preventDefault(); placeUtensil(well.id, u); }} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs">
                        {u.name}
                      </button>
                    ))}
                  </div>
                </details>

                <input type="text" placeholder="Bottom label" value={well.bottomLabel} onChange={(e) => updateLabel(well.id, "bottom", e.target.value)} className="w-full p-2 mt-2 border border-slate-300 rounded text-sm" />
              </div>
            );
          })}
        </div>
      </div>

      {showPDF && (
  <PDFModal
    onClose={() => setShowPDF(false)}
    wells={wells}
    pdfNotes={pdfNotes}
    setPdfNotes={setPdfNotes}
    pdfCompact={pdfCompact}
    setPdfCompact={setPdfCompact}
    getPanColor={getPanColor}
    gridCols={gridCols}
  />
)}
    </div>
  );
};

export default PlanogramView;
