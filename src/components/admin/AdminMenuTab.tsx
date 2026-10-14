import React, { useState } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import type { Food, Category } from '../../types/restaurant';

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
          className="nocturne-surface rounded-2xl p-6 space-y-4 border border-[#8B5CF6]/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              {editingFood ? `Edit Dish: ${editingFood.name}` : 'Create New Culinary Dish'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowDishForm(false);
                setEditingFood(null);
              }}
              className="p-1.5 text-[#7E7394] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">Category</label>
              <select
                value={dishCat}
                onChange={(e) => setDishCat(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
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
                <label className="block text-xs text-[#B8AFC9] mb-1">Price ($)</label>
                <input
                  type="number"
                  required
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={dishDiscount}
                  onChange={(e) => setDishDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">
                Ingredients (comma separated)
              </label>
              <input
                type="text"
                value={dishIngredients}
                onChange={(e) => setDishIngredients(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">
                Dietary Tags (comma separated)
              </label>
              <input
                type="text"
                value={dishTags}
                onChange={(e) => setDishTags(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Description</label>
            <textarea
              rows={2}
              value={dishDesc}
              onChange={(e) => setDishDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#F5F2FA]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishVeg}
                onChange={(e) => setDishVeg(e.target.checked)}
              />
              <span>Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishPopular}
                onChange={(e) => setDishPopular(e.target.checked)}
              />
              <span>Mark Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dishFeatured}
                onChange={(e) => setDishFeatured(e.target.checked)}
              />
              <span>Mark Featured</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#10B981] text-[#081C15] text-xs font-semibold"
            >
              {editingFood ? 'Update Dish' : 'Save New Dish'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDishForm(false);
                setEditingFood(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-[#B8AFC9]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[#7E7394] border-b border-white/10">
            <tr>
              <th className="p-4">Dish</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Discount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono-tabular">
            {foods.map((food) => (
              <tr key={food.id} className="hover:bg-white/5">
                <td className="p-4 font-sans">
                  <p className="font-semibold text-[#F5F2FA]">{food.name}</p>
                  <p className="text-[11px] text-[#7E7394]">
                    {food.isVeg ? 'Vegetarian' : 'Non-Veg'} · {food.prepTimeMinutes}m ·{' '}
                    {food.calories} kcal
                  </p>
                </td>
                <td className="p-4 font-sans text-[#B8AFC9]">{food.categoryName}</td>
                <td className="p-4 text-right text-[#F59E0B]">${food.price.toFixed(2)}</td>
                <td className="p-4 text-right text-[#EC4899]">{food.discountPercent}%</td>
                <td className="p-4 font-sans">
                  <button
                    type="button"
                    onClick={() => onToggleDishAvailability(food)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                      food.isAvailable
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-white/5 text-[#7E7394]'
                    }`}
                  >
                    {food.isAvailable ? 'Available' : 'Disabled'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(food)}
                      aria-label={`Edit ${food.name}`}
                      className="p-1.5 rounded-lg text-[#B8AFC9] hover:text-white hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteDish(food.id)}
                      aria-label={`Delete ${food.name}`}
                      className="p-1.5 rounded-lg text-[#F43F5E] hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
