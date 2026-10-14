import React, { useState } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import type { Food, Category } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminMenuTabProps {
  foods: Food[];
  categories: Category[];
  showDishForm: boolean;
  setShowDishForm: (show: boolean) => void;
  editingFood: Food | null;
  setEditingFood: (food: Food | null) => void;
  onSaveDish: (e: React.FormEvent, data: Partial<Food>) => Promise<void>;
  onToggleDishAvailability: (food: Food) => Promise<void>;
  onDeleteDish: (id: string) => Promise<void>;
}

export const AdminMenuTab: React.FC<AdminMenuTabProps> = ({
  foods,
  categories,
  showDishForm,
  setShowDishForm,
  editingFood,
  setEditingFood,
  onSaveDish,
  onToggleDishAvailability,
  onDeleteDish,
}) => {
  const [dishName, setDishName] = useState('');
  const [dishCat, setDishCat] = useState(categories[0]?.name || 'Main Course');
  const [dishPrice, setDishPrice] = useState('34');
  const [dishDiscount, setDishDiscount] = useState('0');
  const [dishDesc, setDishDesc] = useState('');
  const [dishIngredients, setDishIngredients] = useState('A5 Wagyu, Saffron, Herbs');
  const [dishTags, setDishTags] = useState('Chef Signature, Gluten-Free');
  const [dishPrep, setDishPrep] = useState('22');
  const [dishCalories, setDishCalories] = useState('680');
  const [dishVeg, setDishVeg] = useState(false);
  const [dishPopular, setDishPopular] = useState(true);
  const [dishFeatured, setDishFeatured] = useState(false);

  const openEdit = (food: Food) => {
    setEditingFood(food);
    setDishName(food.name);
    setDishCat(food.categoryName);
    setDishPrice(String(food.price));
    setDishDiscount(String(food.discountPercent));
    setDishDesc(food.description);
    setDishIngredients(food.ingredients.join(', '));
    setDishTags(food.dietaryTags.join(', '));
    setDishPrep(String(food.prepTimeMinutes));
    setDishCalories(String(food.calories));
    setDishVeg(food.isVeg);
    setDishPopular(food.isPopular);
    setDishFeatured(food.isFeatured);
    setShowDishForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    onSaveDish(e, {
      name: dishName,
      categoryName: dishCat,
      price: Number(dishPrice),
      discountPercent: Number(dishDiscount),
      description: dishDesc,
      ingredients: dishIngredients.split(',').map((s) => s.trim()).filter(Boolean),
      dietaryTags: dishTags.split(',').map((s) => s.trim()).filter(Boolean),
      prepTimeMinutes: Number(dishPrep),
      calories: Number(dishCalories),
      isVeg: dishVeg,
      isPopular: dishPopular,
      isFeatured: dishFeatured,
    });
  };

  return (
    <div className="space-y-6">
      {showDishForm && (
        <form
          onSubmit={handleSubmit}
          className="nocturne-surface rounded-2xl p-6 space-y-4 border border-yellow/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              {editingFood ? `Edit Dish: ${editingFood.name}` : 'Create New Culinary Dish'}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDishForm(false);
                setEditingFood(null);
              }}
              aria-label="Close dish form"
              className="p-1.5 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-soft mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-soft mb-1">Category</label>
              <select
                value={dishCat}
                onChange={(e) => setDishCat(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-soft mb-1">Price ($)</label>
                <input
                  type="number"
                  required
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-text-soft mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={dishDiscount}
                  onChange={(e) => setDishDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-soft mb-1">
                Ingredients (comma separated)
              </label>
              <input
                type="text"
                value={dishIngredients}
                onChange={(e) => setDishIngredients(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-soft mb-1">
                Dietary Tags (comma separated)
              </label>
              <input
                type="text"
                value={dishTags}
                onChange={(e) => setDishTags(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-soft mb-1">Description</label>
            <textarea
              rows={2}
              value={dishDesc}
              onChange={(e) => setDishDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-text">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishVeg}
                onChange={(e) => setDishVeg(e.target.checked)}
                className="accent-yellow rounded focus-visible:ring-2 focus-visible:ring-yellow"
              />
              <span>Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishPopular}
                onChange={(e) => setDishPopular(e.target.checked)}
                className="accent-yellow rounded focus-visible:ring-2 focus-visible:ring-yellow"
              />
              <span>Mark Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishFeatured}
                onChange={(e) => setDishFeatured(e.target.checked)}
                className="accent-yellow rounded focus-visible:ring-2 focus-visible:ring-yellow"
              />
              <span>Mark Featured</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              {editingFood ? 'Update Dish' : 'Save New Dish'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setShowDishForm(false);
                setEditingFood(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-text-muted border-b border-border">
            <tr>
              <th className="p-4">Dish</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Discount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono-tabular">
            {foods.map((food) => (
              <tr key={food.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-sans">
                  <p className="font-semibold text-text">{food.name}</p>
                  <p className="text-[11px] text-text-muted">
                    {food.isVeg ? 'Vegetarian' : 'Non-Veg'} · {food.prepTimeMinutes}m ·{' '}
                    {food.calories} kcal
                  </p>
                </td>
                <td className="p-4 font-sans text-text-soft">{food.categoryName}</td>
                <td className="p-4 text-right text-yellow">${food.price.toFixed(2)}</td>
                <td className="p-4 text-right text-yellow">{food.discountPercent}%</td>
                <td className="p-4 font-sans">
                  <button
                    type="button"
                    onClick={() => onToggleDishAvailability(food)}
                    aria-label={`Toggle availability for ${food.name}`}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow rounded-full transition-transform active:scale-95"
                  >
                    <Badge
                      variant={food.isAvailable ? 'success' : 'neutral'}
                      dot
                      className="cursor-pointer"
                    >
                      {food.isAvailable ? 'Available' : 'Disabled'}
                    </Badge>
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(food)}
                      aria-label={`Edit ${food.name}`}
                      className="p-1.5 text-text-soft hover:text-text"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDish(food.id)}
                      aria-label={`Delete ${food.name}`}
                      className="p-1.5 text-danger hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
