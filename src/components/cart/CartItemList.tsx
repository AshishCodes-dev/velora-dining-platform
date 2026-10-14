import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Minus, Plus } from 'lucide-react';
import { DishVisual } from '../DishVisual';
import type { CartItem } from '../../types/restaurant';

interface CartItemListProps {
  activeCartItems: CartItem[];
  savedCartItems: CartItem[];
  amountToFreeDelivery: number;
  onUpdateCartItem: (id: string, updates: Partial<CartItem>) => void;
  onRemoveCartItem: (id: string) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  activeCartItems,
  savedCartItems,
  amountToFreeDelivery,
  onUpdateCartItem,
  onRemoveCartItem,
}) => {
  return (
    <>
      {/* Free Delivery Progress Notice */}
      <div className="nocturne-surface rounded-xl p-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[#B8AFC9]">
          {amountToFreeDelivery === 0 ? (
            <span className="text-[#10B981] font-semibold">
              ✓ You have unlocked Complimentary Heated Obsidian Delivery!
            </span>
          ) : (
            <>
              Add{' '}
              <span className="font-mono-tabular font-semibold text-[#F59E0B]">
                ${amountToFreeDelivery.toFixed(2)}
              </span>{' '}
              more for complimentary heated delivery.
            </>
          )}
        </p>
        <Link
          to="/menu"
          className="text-xs font-semibold text-[#8B5CF6] hover:underline whitespace-nowrap"
        >
          + Add Dishes
        </Link>
      </div>

      {/* Active Cart Items */}
      {activeCartItems.length === 0 ? (
        <div className="nocturne-surface rounded-2xl p-8 text-center">
          <p className="text-sm text-[#B8AFC9]">
            No active items in cart. Move items from "Saved for Later" below or browse the menu.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeCartItems.map((item) => (
            <div
              key={item.id}
              className="nocturne-surface rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Link
                  to={`/menu/${item.foodId}`}
                  className="w-24 h-20 rounded-xl overflow-hidden shrink-0 block"
                >
                  <DishVisual
                    src={item.foodImage}
                    alt={item.foodName}
                    illustrationType={item.illustrationType}
                    showArtAccent={false}
                  />
                </Link>

                <div className="space-y-1 min-w-0 flex-1">
                  <Link
                    to={`/menu/${item.foodId}`}
                    className="font-serif-display text-lg font-semibold text-[#F5F2FA] hover:text-[#8B5CF6] block truncate"
                  >
                    {item.foodName}
                  </Link>
                  <p className="text-xs text-[#B8AFC9]">
                    Size: <span className="text-[#F5F2FA]">{item.selectedSize}</span>
                    {item.selectedAddons.length > 0 && (
                      <>
                        {' '}
                        · Add-ons:{' '}
                        <span className="text-[#10B981]">
                          {item.selectedAddons.map((a) => a.name).join(', ')}
                        </span>
                      </>
                    )}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-[11px] text-[#F59E0B]">
                      Note: "{item.specialInstructions}"
                    </p>
                  )}
                  <div className="pt-1 flex items-center gap-4 text-xs text-[#7E7394]">
                    <button
                      type="button"
                      onClick={() => onUpdateCartItem(item.id, { savedForLater: true })}
                      className="inline-flex items-center gap-1 hover:text-[#F5F2FA] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save for later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.id)}
                      className="inline-flex items-center gap-1 text-[#F43F5E] hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity & Line Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                <span className="font-mono-tabular text-base font-semibold text-[#F59E0B]">
                  ${(item.unitFinalPrice * item.quantity).toFixed(2)}
                </span>
                <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-[#0D0914] border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCartItem(item.id, { quantity: item.quantity - 1 })
                    }
                    aria-label="Decrease quantity"
                    className="p-1 text-[#B8AFC9] hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono-tabular text-xs font-semibold text-[#F5F2FA] w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCartItem(item.id, { quantity: item.quantity + 1 })
                    }
                    aria-label="Increase quantity"
                    className="p-1 text-[#B8AFC9] hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved For Later Section */}
      {savedCartItems.length > 0 && (
        <div className="pt-6 space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
            Saved for Later ({savedCartItems.length})
          </h2>
          <div className="space-y-3">
            {savedCartItems.map((item) => (
              <div
                key={item.id}
                className="nocturne-surface rounded-xl p-4 flex items-center justify-between gap-4 opacity-90"
              >
                <div>
                  <p className="text-sm font-semibold text-[#F5F2FA]">{item.foodName}</p>
                  <p className="text-xs text-[#7E7394] font-mono-tabular">
                    {item.selectedSize} · ${item.unitFinalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateCartItem(item.id, { savedForLater: false })}
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold"
                  >
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveCartItem(item.id)}
                    className="p-1.5 text-[#F43F5E] hover:bg-white/5 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
