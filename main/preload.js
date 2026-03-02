/**
 * preload.js — contextBridge IPC API
 * Exposes safe, typed channels to the renderer process.
 * React never imports Node modules directly.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  auth: {
    login:  (creds)  => ipcRenderer.invoke('auth:login', creds),
    logout: ()       => ipcRenderer.invoke('auth:logout'),
  },
  inventory: {
    getItems:       (filters) => ipcRenderer.invoke('inventory:getItems', filters),
    createItem:     (data)    => ipcRenderer.invoke('inventory:createItem', data),
    updateItem:     (id, data)=> ipcRenderer.invoke('inventory:updateItem', id, data),
    deleteItem:     (id)      => ipcRenderer.invoke('inventory:deleteItem', id),
    getCategories:  ()        => ipcRenderer.invoke('inventory:getCategories'),
    createCategory: (data)    => ipcRenderer.invoke('inventory:createCategory', data),
    updateCategory: (id,data) => ipcRenderer.invoke('inventory:updateCategory', id, data),
    deleteCategory: (id)      => ipcRenderer.invoke('inventory:deleteCategory', id),
  },
  loans: {
    createLoan:    (data)    => ipcRenderer.invoke('loans:createLoan', data),
    getActiveLoans:()        => ipcRenderer.invoke('loans:getActiveLoans'),
    getOverdueLoans:()       => ipcRenderer.invoke('loans:getOverdueLoans'),
    returnItem:    (data)    => ipcRenderer.invoke('loans:returnItem', data),
    getHistory:    (filters) => ipcRenderer.invoke('loans:getHistory', filters),
  },
  reports: {
    generate:  (type, filters) => ipcRenderer.invoke('reports:generate', type, filters),
    exportPDF: (data)          => ipcRenderer.invoke('reports:exportPDF', data),
  },
  settings: {
    get:    (key)      => ipcRenderer.invoke('settings:get', key),
    set:    (key, val) => ipcRenderer.invoke('settings:set', key, val),
    getAll: ()         => ipcRenderer.invoke('settings:getAll'),
  },
  backup: {
    create:  (opts) => ipcRenderer.invoke('backup:create', opts),
    restore: (opts) => ipcRenderer.invoke('backup:restore', opts),
  },
  recovery: {
    generate: ()     => ipcRenderer.invoke('recovery:generate'),
    reset:    (opts) => ipcRenderer.invoke('recovery:reset', opts),
  }
});
