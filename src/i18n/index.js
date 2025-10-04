import { useCallback } from 'react';

export const i18n = {
  en: {
    save: 'Save', print: 'Print', today: 'TODAY', loading: 'Loading...', saving: 'Saving...',
    undo: 'Undo', redo: 'Redo', quickSettings: 'Quick Settings', title: 'Main Title',
    add: 'Add Item', clone: 'Clone Item', remove: 'Remove Item', edit: 'Edit Item', toggleTemp: 'Click to toggle',
    lowStock: 'Low Stock', inventory: 'Inventory', resetTally: 'Reset Tally', addNew: 'Add New',
    moveUp: 'Move Up', moveDown: 'Move Down', moveItem: 'Moved item {from} to position {to}',
    pan: 'Pan', temp: 'Temp', food: 'Food Item', utensil: 'Utensil',
    serviceStart: 'Service Start', serviceEnd: 'Service End',
  },
  es: {
    save: 'Guardar', print: 'Imprimir', today: 'HOY', loading: 'Cargando...', saving: 'Guardando...',
    undo: 'Deshacer', redo: 'Rehacer', quickSettings: 'Ajustes Rápidos', title: 'Título principal',
    add: 'Agregar Ítem', clone: 'Clonar Ítem', remove: 'Eliminar Ítem', edit: 'Editar Ítem', toggleTemp: 'Clic para cambiar',
    lowStock: 'Bajo Stock', inventory: 'Inventario', resetTally: 'Restablecer Cuenta', addNew: 'Añadir Nuevo',
    moveUp: 'Mover Arriba', moveDown: 'Mover Abajo', moveItem: 'Ítem {from} movido a posición {to}',
    pan: 'Bandeja', temp: 'Temp', food: 'Alimento', utensil: 'Utensilio',
    serviceStart: 'Inicio Servicio', serviceEnd: 'Fin Servicio',
  },
};

export const useI18n = (locale = 'en') => {
  const dict = i18n[locale] || i18n.en;
  return useCallback((key, replacements = {}) => {
    let msg = dict[key] || i18n.en[key] || key;
    for (const [k, v] of Object.entries(replacements)) msg = msg.replace(`{${k}}`, v);
    return msg;
  }, [locale]);
};