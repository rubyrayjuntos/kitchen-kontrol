import { useState } from 'react';

export function useUndoRedoReducer(reducer, initialState){
  const [history, setHistory] = useState({ past: [], present: initialState, future: [] });

  const dispatch = (action) => {
    // Replace without recording history (useful after loads)
    if (action?.type === 'replace') {
      setHistory({ past: [], present: action.payload, future: [] });
      return;
    }
    const newPresent = reducer(history.present, action);
    if (Object.is(newPresent, history.present)) return;
    setHistory(prev => ({ past: [...prev.past, prev.present], present: newPresent, future: [] }));
    if (action.type === 'reorder' && typeof action.onReorder === 'function') {
      action.onReorder(action.from, action.to);
    }
  };

  const undo = () => setHistory(prev => {
    if (!prev.past.length) return prev;
    const previous = prev.past[prev.past.length - 1];
    const newPast = prev.past.slice(0, -1);
    return { past: newPast, present: previous, future: [prev.present, ...prev.future] };
  });

  const redo = () => setHistory(prev => {
    if (!prev.future.length) return prev;
    const next = prev.future[0];
    const newFuture = prev.future.slice(1);
    return { past: [...prev.past, prev.present], present: next, future: newFuture };
  });

  const replace = (next) => setHistory({ past: [], present: next, future: [] });

  return [history.present, dispatch, { undo, redo, canUndo: history.past.length>0, canRedo: history.future.length>0, replace }];
}