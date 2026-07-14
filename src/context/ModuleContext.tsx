import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { monthKey } from '../lib/date';
import { todayISO } from '../lib/recurring';
import { Module } from '../types';

const STORAGE_KEY = 'bpo:selectedModule';

interface ModuleContextValue {
  module: Module;
  setModule: (m: Module) => void;
  displayedMonth: string; // YYYY-MM
  setDisplayedMonth: (m: string) => void;
}

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [module, setModuleState] = useState<Module>('pessoal');
  const [displayedMonth, setDisplayedMonth] = useState<string>(monthKey(todayISO()));

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'pessoal' || saved === 'empresa') setModuleState(saved);
    });
  }, []);

  const setModule = (m: Module) => {
    setModuleState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  return (
    <ModuleContext.Provider value={{ module, setModule, displayedMonth, setDisplayedMonth }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule(): ModuleContextValue {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModule must be used within ModuleProvider');
  return ctx;
}
