
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  Trash2, 
  CheckCircle2, 
  Heart, 
  ChevronRight, 
  X,
  RotateCcw,
  Check,
  ShoppingBag,
  Sparkles,
  Loader2,
  PackagePlus,
  Tag,
  IndianRupee,
  Layers,
  ChevronDown,
  ChevronUp,
  Languages,
  BookOpen,
  Trash,
  Download,
  Upload,
  Database,
  CloudOff,
  ShieldCheck,
  Filter,
  FilterX,
  Scale
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { MASTER_ITEMS } from './constants';
import { MasterItem, ShoppingItem, HistoryEntry, AppSettings, View, Unit } from './types';

// Helper for local storage
const STORAGE_KEYS = {
  SHOPPING_LIST: 'namma_list_current',
  HISTORY: 'namma_list_history',
  SETTINGS: 'namma_list_settings',
  USER_ITEMS: 'namma_list_user_items',
};

// Unit Presets Map
const UNIT_PRESETS: Record<string, number[]> = {
  'kg': [0.5, 1, 1.5, 2, 2.5, 5],
  'litre': [0.5, 1, 1.5, 2, 2.5, 5],
  'g': [100, 250, 500, 750],
  'ml': [100, 200, 250, 500],
  'piece': [1, 2, 4, 6, 10, 12],
  'packet': [1, 2, 3, 5, 10],
  'bundle': [1, 2, 3],
  'box': [1, 2, 5],
  'tin': [1, 2]
};

// Custom Dropdown Component
interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#DDECF6] rounded-xl p-3 focus:ring-2 focus:ring-[#9BCBE5] outline-none font-medium text-[#184E6C] transition-all text-left"
      >
        <span className="capitalize truncate">{value}</span>
        {isOpen ? <ChevronUp size={16} className="text-[#9BCBE5]" /> : <ChevronDown size={16} className="text-[#9BCBE5]" />}
      </button>

      {isOpen && (
        <div className="absolute z-[60] left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#DDECF6] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-2 border-l-4 ${
                  value === opt 
                    ? 'bg-[#DDECF6] text-[#184E6C] border-[#184E6C] font-bold' 
                    : 'text-gray-600 border-transparent hover:bg-gray-50'
                }`}
              >
                <span className="capitalize">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // State
  const [activeView, setActiveView] = useState<View>(View.SHOPPING);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ favorites: [] });
  const [userItems, setUserItems] = useState<MasterItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // Filtering state for catalog
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<MasterItem>>({
    name: '',
    tanglishName: '',
    category: 'Staples',
    defaultUnit: 'kg',
    defaultPrice: 0
  });

  // AI State
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const CATEGORIES = ['Staples', 'Spices', 'Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Cleaning', 'Care', 'Frozen', 'Others'];
  const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'packet', 'bundle', 'box', 'tin'];

  // Combine Master Items and User Items
  const allItems = useMemo(() => [...MASTER_ITEMS, ...userItems], [userItems]);

  // Grouped Items for Catalog with Filtering
  const groupedItems = useMemo(() => {
    const filtered = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                           item.tanglishName.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesUnit = !selectedUnit || item.defaultUnit === selectedUnit;
      
      return matchesSearch && matchesCategory && matchesUnit;
    });
    
    const groups: { [key: string]: MasterItem[] } = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [allItems, catalogSearch, selectedCategory, selectedUnit]);

  // Fix: Added filteredItems for global search modal to resolve the 'Cannot find name filteredItems' error
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return [];
    return allItems.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.tanglishName.toLowerCase().includes(q)
    );
  }, [allItems, searchQuery]);

  // Load Initial Data once
  useEffect(() => {
    const load = () => {
      try {
        const savedList = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const savedUserItems = localStorage.getItem(STORAGE_KEYS.USER_ITEMS);

        if (savedList) setShoppingList(JSON.parse(savedList));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedUserItems) setUserItems(JSON.parse(savedUserItems));
      } catch (e) {
        console.error("Corrupt local storage data", e);
      } finally {
        setIsLoaded(true);
      }
    };

    // Check persistence status
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsPersistent);
    }

    load();
  }, []);

  // Atomic Persistence Logic
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(shoppingList));
    triggerSaveIndicator();
  }, [shoppingList, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    triggerSaveIndicator();
  }, [history, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    triggerSaveIndicator();
  }, [settings, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.USER_ITEMS, JSON.stringify(userItems));
    triggerSaveIndicator();
  }, [userItems, isLoaded]);

  const triggerSaveIndicator = () => {
    setShowSavedToast(true);
    const timer = setTimeout(() => setShowSavedToast(false), 2000);
    return () => clearTimeout(timer);
  };

  // Automatic Translation Logic for New Product
  useEffect(() => {
    const name = newItem.name?.trim();
    if (!name || name.length < 3 || activeView !== View.ADD_ITEM) return;

    if (translationTimer.current) clearTimeout(translationTimer.current);

    translationTimer.current = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Translate "${name}" into a simple Tanglish grocery name. Examples: "Onion" -> "Vengayam". Return ONLY JSON: {"tanglish": "string"}.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tanglish: { type: Type.STRING }
              }
            }
          }
        });

        const text = response.text;
        if (text) {
          const result = JSON.parse(text);
          if (result.tanglish) {
            setNewItem(prev => ({ ...prev, tanglishName: result.tanglish }));
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        setIsTranslating(false);
      }
    }, 800);

    return () => {
      if (translationTimer.current) clearTimeout(translationTimer.current);
    };
  }, [newItem.name, activeView]);

  // Tanglish Input Helper
  useEffect(() => {
    if (searchQuery.length < 2) {
      setAiSuggestions([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Suggest 4 standard grocery item names for query "${searchQuery}". Return ONLY JSON array of strings.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });

        const text = response.text;
        if (text) {
          const suggestions = JSON.parse(text);
          setAiSuggestions(suggestions);
        }
      } catch (error) {
        console.error("AI Suggestions error:", error);
      } finally {
        setIsAiLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Backup & Restore
  const exportBackup = () => {
    const data = {
      shoppingList,
      history,
      settings,
      userItems,
      version: '1.3',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `namma-list-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm("Restore this backup?")) {
          if (data.shoppingList) setShoppingList(data.shoppingList);
          if (data.history) setHistory(data.history);
          if (data.settings) setSettings(data.settings);
          if (data.userItems) setUserItems(data.userItems);
          alert("Backup restored!");
        }
      } catch (e) {
        alert("Invalid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const requestDurableStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const persisted = await navigator.storage.persist();
      setIsPersistent(persisted);
      if (persisted) alert("Storage is now durable!");
    }
  };

  // Actions
  const addToShoppingList = (master: MasterItem) => {
    const exists = shoppingList.find(item => item.id === master.id);
    if (exists) {
      setShoppingList(prev => prev.map(item => 
        item.id === master.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      const newItem: ShoppingItem = {
        ...master,
        quantity: 1,
        isBought: false,
        userPrice: master.defaultPrice,
      };
      setShoppingList(prev => [...prev, newItem]);
    }
    setSearchQuery('');
    setAiSuggestions([]);
    setIsSearchOpen(false);
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleBought = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setShoppingList(prev => prev.map(item => {
      if (item.id === id) {
        let step = 1;
        if (item.defaultUnit === 'kg' || item.defaultUnit === 'litre') step = 0.5;
        const newVal = Math.max(step, item.quantity + (delta * step));
        return { ...item, quantity: newVal };
      }
      return item;
    }));
  };

  const setExactQuantity = (id: string, val: number) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: val } : item
    ));
  };

  const updatePrice = (id: string, price: number) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, userPrice: price } : item
    ));
  };

  const toggleFavorite = (id: string) => {
    setSettings(prev => {
      const isFav = prev.favorites.includes(id);
      return {
        ...prev,
        favorites: isFav ? prev.favorites.filter(fid => fid !== id) : [...prev.favorites, id]
      };
    });
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.tanglishName) return;
    const itemToAdd: MasterItem = {
      id: `user-${Date.now()}`,
      name: newItem.name!,
      tanglishName: newItem.tanglishName!,
      category: newItem.category || 'Others',
      defaultUnit: (newItem.defaultUnit as Unit) || 'packet',
      defaultPrice: newItem.defaultPrice || 0,
    };
    setUserItems(prev => [...prev, itemToAdd]);
    setNewItem({ name: '', tanglishName: '', category: 'Staples', defaultUnit: 'kg', defaultPrice: 0 });
    setActiveView(View.CATALOG);
  };

  const completeShopping = () => {
    if (shoppingList.length === 0) return;
    const boughtItems = shoppingList.filter(i => i.isBought);
    if (boughtItems.length === 0) return;

    const total = boughtItems.reduce((acc, item) => acc + (item.userPrice * item.quantity), 0);
    const newHistoryEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      totalAmount: Math.round(total),
      itemCount: boughtItems.length,
      items: boughtItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.userPrice })),
    };

    setHistory(prev => [newHistoryEntry, ...prev]);
    setShoppingList(prev => prev.filter(i => !i.isBought));
    setActiveView(View.HISTORY);
  };

  const clearHistory = () => {
    if (window.confirm("Clear all history?")) setHistory([]);
  };

  const clearShoppingList = () => {
    if (window.confirm("Clear current list?")) setShoppingList([]);
  };

  const resetApp = () => {
    if (window.confirm("Reset everything?")) { localStorage.clear(); window.location.reload(); }
  };

  const totalEstimate = useMemo(() => {
    return Math.round(shoppingList.reduce((acc, item) => acc + (item.userPrice * item.quantity), 0));
  }, [shoppingList]);

  const boughtCount = shoppingList.filter(i => i.isBought).length;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto shadow-2xl bg-white relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#184E6C] text-white p-5 pt-8 shadow-md relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">நம்ம List</h1>
          <div className="flex items-center gap-2">
            {showSavedToast && <div className="text-[10px] font-bold text-[#9BCBE5] flex items-center gap-1 animate-pulse"><Check size={10} /> Syncing...</div>}
            <div className="p-1.5 bg-white/10 rounded-lg text-white/40"><CloudOff size={14} /></div>
          </div>
        </div>
        <div onClick={() => setIsSearchOpen(true)} className="bg-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all border border-white/10">
          <Search size={18} className="text-white/60" />
          <span className="text-white/60 text-sm">Add something to your list...</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
        {activeView === View.SHOPPING && (
          <div className="space-y-4">
            {shoppingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ShoppingBag size={64} className="mb-4 opacity-10" />
                <p className="text-lg font-medium text-gray-300">Your list is empty</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end bg-[#DDECF6]/30 p-4 rounded-2xl border border-[#DDECF6]">
                  <div>
                    <h2 className="text-[10px] font-bold text-[#184E6C] uppercase tracking-widest opacity-60">Status</h2>
                    <p className="text-lg font-bold text-gray-800">{boughtCount} / {shoppingList.length} bought</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-[10px] font-bold text-[#184E6C] uppercase tracking-widest opacity-60">Total Estimate</h2>
                    <p className="text-xl font-black text-[#184E6C]">₹{totalEstimate}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {shoppingList.map((item) => (
                    <div key={item.id} className={`p-4 rounded-2xl border transition-all ${item.isBought ? 'bg-gray-50 border-gray-100' : 'bg-white border-[#DDECF6] shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => toggleBought(item.id)} className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${item.isBought ? 'bg-[#387EA2] border-[#387EA2] text-white' : 'border-gray-200 text-transparent'}`}><Check size={16} /></button>
                        <div className="flex-1">
                          <h3 className={`font-semibold leading-tight ${item.isBought ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</h3>
                          <p className={`text-xs ${item.isBought ? 'text-gray-300' : 'text-[#387EA2]/60'}`}>{item.tanglishName}</p>
                        </div>
                        <button onClick={() => removeFromShoppingList(item.id)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                      </div>

                      {/* Quantity Preset Bar */}
                      {!item.isBought && (
                        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                          {UNIT_PRESETS[item.defaultUnit]?.map(val => (
                            <button 
                              key={val} 
                              onClick={() => setExactQuantity(item.id, val)}
                              className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${item.quantity === val ? 'bg-[#184E6C] text-white border-[#184E6C]' : 'bg-[#F8FAFC] text-gray-500 border-gray-100 hover:border-[#9BCBE5]'}`}
                            >
                              {val} {item.defaultUnit}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center bg-[#DDECF6]/50 rounded-xl p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#184E6C] hover:bg-white rounded-lg transition-colors font-bold">-</button>
                          <span className="min-w-[40px] text-center font-bold text-[#184E6C] text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-[#184E6C] hover:bg-white rounded-lg transition-colors font-bold">+</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">₹</span>
                          <input type="number" value={item.userPrice} onChange={(e) => updatePrice(item.id, parseInt(e.target.value) || 0)} className="w-20 bg-white border border-[#DDECF6] rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 text-right focus:ring-2 focus:ring-[#9BCBE5] outline-none" />
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{item.defaultUnit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {boughtCount > 0 && (
                  <button onClick={completeShopping} className="w-full bg-[#184E6C] hover:bg-[#0D2F41] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#DDECF6] transition-all mt-6 active:scale-[0.98]">
                    <CheckCircle2 size={20} /> Finish & Save History
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {activeView === View.CATALOG && (
          <div className="space-y-6 pb-8">
            <div className="sticky top-0 bg-white pt-2 pb-4 z-10 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-gray-800">Item Catalog</h2>
                {(selectedCategory || selectedUnit || catalogSearch) && (
                  <button onClick={() => { setSelectedCategory(null); setSelectedUnit(null); setCatalogSearch(''); }} className="text-xs font-bold text-[#387EA2] flex items-center gap-1">
                    <FilterX size={14} /> Reset
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BCBE5]" size={18} />
                <input type="text" placeholder="Search catalog..." className="w-full bg-[#F8FAFC] border border-[#DDECF6] rounded-xl py-2.5 pl-10 pr-4 outline-none font-medium text-[#184E6C]" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
              </div>
              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setSelectedCategory(null)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${!selectedCategory ? 'bg-[#184E6C] text-white' : 'bg-[#DDECF6] text-[#184E6C]'}`}>All</button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${selectedCategory === cat ? 'bg-[#184E6C] text-white' : 'bg-[#DDECF6] text-[#184E6C]'}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="space-y-8 mt-4">
              {Object.keys(groupedItems).sort().map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2"><Layers size={10} /> {category}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {groupedItems[category].map(item => (
                      <ItemRow key={item.id} item={item} isFav={settings.favorites.includes(item.id)} onAdd={() => addToShoppingList(item)} onToggleFav={() => toggleFavorite(item.id)} isInList={shoppingList.some(i => i.id === item.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === View.ADD_ITEM && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
            <form onSubmit={handleAddNewProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> English Name</label>
                <div className="relative">
                  <input required type="text" placeholder="e.g. Basmati Rice" className="w-full bg-white border border-[#DDECF6] rounded-xl p-3 outline-none font-medium text-[#184E6C]" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                  {isTranslating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#9BCBE5]" size={16} />}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Languages size={10} /> Tanglish Name</label>
                <input required type="text" placeholder="Auto-translated..." className="w-full bg-white border border-[#DDECF6] rounded-xl p-3 outline-none font-medium text-[#184E6C]" value={newItem.tanglishName} onChange={e => setNewItem({...newItem, tanglishName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomDropdown label="Category" value={newItem.category || 'Staples'} options={CATEGORIES} onChange={(val) => setNewItem({...newItem, category: val})} icon={<Layers size={10} />} />
                <CustomDropdown label="Unit" value={newItem.defaultUnit || 'kg'} options={UNITS} onChange={(val) => setNewItem({...newItem, defaultUnit: val as Unit})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><IndianRupee size={10} /> Default Price</label>
                <input type="number" className="w-full bg-white border border-[#DDECF6] rounded-xl p-3 outline-none font-medium text-[#184E6C]" value={newItem.defaultPrice} onChange={e => setNewItem({...newItem, defaultPrice: parseInt(e.target.value) || 0})} />
              </div>
              <button type="submit" className="w-full bg-[#184E6C] hover:bg-[#0D2F41] text-white py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95">Add to Database</button>
            </form>
          </div>
        )}

        {activeView === View.HISTORY && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Shopping History</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400"><HistoryIcon size={64} className="mx-auto mb-4 opacity-10" /><p>No history yet.</p></div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div><p className="text-[10px] font-bold text-[#387EA2] uppercase">{entry.date}</p><h3 className="font-bold text-gray-800">{entry.itemCount} Items</h3></div>
                    <p className="text-xl font-black text-[#184E6C]">₹{entry.totalAmount}</p>
                  </div>
                </div>
              ))
            )}
            {history.length > 0 && <button onClick={clearHistory} className="w-full text-red-400 text-xs font-bold uppercase py-6 flex items-center justify-center gap-1"><Trash2 size={14} /> Clear History</button>}
          </div>
        )}

        {activeView === View.SETTINGS && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Settings</h2>
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2"><Database size={12} /> Data & Backup</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={exportBackup} className="flex flex-col items-center justify-center gap-2 p-5 bg-white border border-[#DDECF6] rounded-2xl text-[#184E6C]"><Download size={20} /><span className="text-xs font-bold uppercase">Export</span></button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-5 bg-white border border-[#DDECF6] rounded-2xl text-[#184E6C]"><Upload size={20} /><span className="text-xs font-bold uppercase">Restore</span></button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </div>
              <div className="p-4 bg-[#F8FAFC] border border-[#DDECF6] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><ShieldCheck size={18} className={isPersistent ? "text-green-500" : "text-gray-400"} /><span className="text-sm font-semibold text-[#184E6C]">Durable Storage</span></div>
                  {!isPersistent && <button onClick={requestDurableStorage} className="text-[10px] font-bold text-[#387EA2] border border-[#387EA2] px-2 py-1 rounded-lg">Enable</button>}
                </div>
              </div>
            </section>
            <section className="space-y-3">
              <button onClick={clearShoppingList} className="w-full flex items-center justify-between p-4 bg-orange-50/30 border border-orange-100 rounded-2xl font-semibold text-orange-700">Clear Current List <ChevronRight size={18} /></button>
              <button onClick={resetApp} className="w-full flex items-center justify-between p-4 bg-red-50/30 border border-red-50 rounded-2xl font-semibold text-red-500">Factory Reset App <ChevronRight size={18} /></button>
            </section>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-4 px-2 shadow-2xl z-40">
        {[
          { v: View.SHOPPING, i: ShoppingCart, l: 'List' },
          { v: View.CATALOG, i: BookOpen, l: 'Items' },
          { v: View.ADD_ITEM, i: PackagePlus, l: 'Add' },
          { v: View.HISTORY, i: HistoryIcon, l: 'History' },
          { v: View.SETTINGS, i: SettingsIcon, l: 'Settings' }
        ].map((tab) => (
          <button key={tab.v} onClick={() => setActiveView(tab.v)} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeView === tab.v ? 'text-[#184E6C] scale-110' : 'text-gray-300'}`}>
            <tab.i size={20} strokeWidth={activeView === tab.v ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.l}</span>
          </button>
        ))}
      </nav>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <header className="p-5 border-b border-[#DDECF6]">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 text-gray-400"><X size={24} /></button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BCBE5]" size={20} />
                <input autoFocus type="text" placeholder="Search items..." className="w-full bg-[#DDECF6]/30 rounded-2xl py-3 pl-10 pr-4 outline-none font-medium text-[#184E6C]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {aiSuggestions.map((s, idx) => (
                  <button key={idx} onClick={() => setSearchQuery(s)} className="whitespace-nowrap bg-[#DDECF6] text-[#184E6C] px-4 py-1.5 rounded-full text-xs font-bold border border-[#9BCBE5]/30">{s}</button>
                ))}
              </div>
            )}
          </header>
          <main className="flex-1 overflow-y-auto p-5 space-y-4">
            {(searchQuery ? filteredItems : allItems.slice(0, 10)).map(item => (
              <ItemRow key={item.id} item={item} isFav={settings.favorites.includes(item.id)} onAdd={() => addToShoppingList(item)} onToggleFav={() => toggleFavorite(item.id)} isInList={shoppingList.some(i => i.id === item.id)} />
            ))}
          </main>
        </div>
      )}
    </div>
  );
};

interface ItemRowProps {
  item: MasterItem;
  isFav: boolean;
  isInList: boolean;
  onAdd: () => void;
  onToggleFav: () => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, isFav, isInList, onAdd, onToggleFav }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex-1">
      <h4 className="font-bold text-[#184E6C]">{item.name}</h4>
      <p className="text-xs text-[#387EA2]/60">{item.tanglishName} • {item.category}</p>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onToggleFav} className={`p-2 rounded-xl ${isFav ? 'text-red-500 bg-red-50' : 'text-gray-200'}`}><Heart size={20} fill={isFav ? 'currentColor' : 'none'} /></button>
      {isInList ? (
        <span className="bg-[#DDECF6] text-[#184E6C] px-3 py-2 rounded-xl text-xs font-bold">In List</span>
      ) : (
        <button onClick={onAdd} className="bg-[#387EA2] text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all">Add</button>
      )}
    </div>
  </div>
);

export default App;
