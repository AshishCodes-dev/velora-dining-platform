import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Category } from '../../types/restaurant';
import { Button } from '../ui/Button';

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
        <h2 className="font-serif-display text-xl font-semibold text-text">
          Add Menu Category
        </h2>
        <div>
          <label className="block text-xs text-text-soft mb-1">Category Name</label>
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Sommelier Cheese Board"
            className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Description</label>
          <input
            type="text"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            placeholder="Artisanal aged cheeses & accompaniments"
            className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
        >
          Create Category
        </Button>
      </form>

      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4 transition-colors hover:border-border-accent"
          >
            <div>
              <p className="text-sm font-semibold text-text">{cat.name}</p>
              <p className="text-xs text-text-soft mt-0.5">{cat.description}</p>
              <p className="text-[11px] font-mono-tabular text-green-light mt-1">
                {cat.dishCount ?? 0} active dishes
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteCategory(cat.id)}
              aria-label={`Delete category ${cat.name}`}
              className="p-2 text-danger hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
