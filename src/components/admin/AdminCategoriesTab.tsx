import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Category } from '../../types/restaurant';

interface AdminCategoriesTabProps {
  categories: Category[];
  onAddCategory: (name: string, description: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await onAddCategory(newCatName, newCatDesc);
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 nocturne-surface rounded-2xl p-6 space-y-4 h-fit"
      >
        <h2 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
          Add Menu Category
        </h2>
        <div>
          <label className="block text-xs text-[#B8AFC9] mb-1">Category Name</label>
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Sommelier Cheese Board"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#B8AFC9] mb-1">Description</label>
          <input
            type="text"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            placeholder="Artisanal aged cheeses & accompaniments"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
        >
          Create Category
        </button>
      </form>

      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F2FA]">{cat.name}</p>
              <p className="text-xs text-[#B8AFC9] mt-0.5">{cat.description}</p>
              <p className="text-[11px] font-mono-tabular text-[#10B981] mt-1">
                {cat.dishCount ?? 0} active dishes
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteCategory(cat.id)}
              aria-label={`Delete category ${cat.name}`}
              className="p-2 text-[#F43F5E] hover:bg-white/5 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
