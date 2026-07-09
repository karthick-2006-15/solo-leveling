import { Shield, Box, Key, Droplet, Crown, Sparkles } from 'lucide-react';

export const rarityConfig: Record<string, { color: string, border: string, bg: string, shadow: string }> = {
  Common: { color: 'text-gray-400', border: 'border-gray-600/50', bg: 'bg-gray-900/40', shadow: 'hover:shadow-[0_0_15px_rgba(156,163,175,0.3)]' },
  Uncommon: { color: 'text-green-400', border: 'border-green-600/50', bg: 'bg-green-900/30', shadow: 'hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]' },
  Rare: { color: 'text-blue-400', border: 'border-blue-600/50', bg: 'bg-blue-900/30', shadow: 'hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
  Epic: { color: 'text-purple-400', border: 'border-purple-600/50', bg: 'bg-purple-900/30', shadow: 'hover:shadow-[0_0_15px_rgba(192,132,252,0.4)]' },
  Legendary: { color: 'text-yellow-400', border: 'border-yellow-600/50', bg: 'bg-yellow-900/30', shadow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]' },
  Mythic: { color: 'text-red-500', border: 'border-red-600/50', bg: 'bg-red-900/30', shadow: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]' },
  Monarch: { color: 'text-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-900/40', shadow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]' }
};

export const getIcon = (type: string) => {
  switch(type) {
    case 'consumable': return <Droplet className="w-8 h-8" />;
    case 'badge': return <Shield className="w-8 h-8" />;
    case 'relic': return <Sparkles className="w-8 h-8" />;
    case 'key': return <Key className="w-8 h-8" />;
    case 'title': return <Crown className="w-8 h-8" />;
    default: return <Box className="w-8 h-8" />;
  }
};
