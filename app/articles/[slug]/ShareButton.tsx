"use client";

import { Share2 } from 'lucide-react';

export default function ShareButton() {
  return (
    <button 
      onClick={() => alert("共有機能は現在開発中です。")} 
      className="flex items-center"
    >
      <Share2 className="w-4 h-4 mr-1" />
      共有
    </button>
  );
} 