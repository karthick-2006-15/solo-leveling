import React from 'react';
import { Search, Filter, SortDesc } from 'lucide-react';

interface InventoryFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({ filters, setFilters }) => {
  const handleChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-black/60 border border-cyan-900/30 rounded-xl p-4 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center">
      
      {/* Search Bar */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
        <input 
          type="text" 
          placeholder="SEARCH INVENTORY..." 
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full bg-black/40 border border-cyan-900/50 rounded-lg py-2 pl-10 pr-4 text-sm text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Filter className="w-4 h-4 text-gray-400" />
        <select 
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="bg-black/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-[150px]"
        >
          <option value="">ALL CATEGORIES</option>
          <option value="Consumable">CONSUMABLES</option>
          <option value="Relic">RELICS</option>
          <option value="Material">MATERIALS</option>
          <option value="Badge">BADGES</option>
          <option value="Key">KEYS</option>
          <option value="Title">TITLES</option>
        </select>
      </div>

      {/* Rarity Filter */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <select 
          value={filters.rarity || ''}
          onChange={(e) => handleChange('rarity', e.target.value)}
          className="bg-black/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-[150px]"
        >
          <option value="">ALL RARITIES</option>
          <option value="Common" className="text-gray-400">COMMON</option>
          <option value="Uncommon" className="text-green-400">UNCOMMON</option>
          <option value="Rare" className="text-blue-400">RARE</option>
          <option value="Epic" className="text-purple-400">EPIC</option>
          <option value="Legendary" className="text-yellow-400">LEGENDARY</option>
          <option value="Mythic" className="text-red-500">MYTHIC</option>
          <option value="Monarch" className="text-cyan-400">MONARCH</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <SortDesc className="w-4 h-4 text-gray-400" />
        <select 
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="bg-black/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-[150px]"
        >
          <option value="newest">NEWEST FIRST</option>
          <option value="oldest">OLDEST FIRST</option>
          <option value="name">ALPHABETICAL</option>
          <option value="rarity">RARITY</option>
        </select>
      </div>

    </div>
  );
};
