import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DishVisual } from '../DishVisual';
import type { CartItem } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

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
        <p className="text-xs text-text-soft">
          {amountToFreeDelivery === 0 ? (
            <span className="text-green-light font-semibold">
              ✓ You have unlocked Complimentary Heated Obsidian Delivery!
            </span>
          ) : (
            <>
              Add{' '}
              <span className="font-mono-tabular font-semibold text-yellow">
                ${amountToFreeDelivery.toFixed(2)}
              </span>{' '}
              more for complimentary heated delivery.
            </>
          )}
        </p>
        <Link
          to="/menu"
          className="text-xs font-semibold text-yellow hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded px-1"
        >
          + Add Dishes
        </Link>
      </div>

      {/* Active Cart Items */}
      {activeCartItems.length === 0 ? (
        <div className="nocturne-surface rounded-2xl p-8 text-center">
          <p className="text-sm text-text-soft">
            No active items in cart. Move items from "Saved for Later" below or browse the menu.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {activeCartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="nocturne-surface rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Link
                    to={`/menu/${item.foodId}`}
                    className="w-24 h-20 rounded-xl overflow-hidden shrink-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
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
                      className="font-serif-display text-lg font-semibold text-text hover:text-yellow block truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded"
                    >
                      {item.foodName}
                    </Link>
                    <p className="text-xs text-text-soft">
                      Size: <span className="text-text">{item.selectedSize}</span>
                      {item.selectedAddons.length > 0 && (
                        <>
                          {' '}
                          · Add-ons:{' '}
                          <span className="text-green-light">
                            {item.selectedAddons.map((a) => a.name).join(', ')}
                          </span>
                        </>
                      )}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-[11px] text-yellow">
                        Note: "{item.specialInstructions}"
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-4 text-xs text-text-muted">
                      <button
                        type="button"
                        onClick={() => onUpdateCartItem(item.id, { savedForLater: true })}
                        className="inline-flex items-center gap-1 text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded px-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save for later</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveCartItem(item.id)}
                        className="inline-flex items-center gap-1 text-danger hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger rounded px-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity & Line Total */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <span className="font-mono-tabular text-base font-semibold text-yellow">
                    ${(item.unitFinalPrice * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-canvas border border-border">
                    {item.quantity <= 1 ? (
                      <Tooltip content="Minimum 1 portion">
                        <motion.button
                          type="button"
                          disabled
                          aria-label="Decrease quantity"
                          className="p-1 text-text-muted/40 cursor-not-allowed rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                      </Tooltip>
                    ) : (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() =>
                          onUpdateCartItem(item.id, { quantity: item.quantity - 1 })
                        }
                        aria-label="Decrease quantity"
                        className="p-1 text-text-soft hover:text-text hover:bg-white/5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                    <span className="font-mono-tabular text-xs font-semibold text-text w-5 text-center select-none">
                      {item.quantity}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() =>
                        onUpdateCartItem(item.id, { quantity: item.quantity + 1 })
                      }
                      aria-label="Increase quantity"
                      className="p-1 text-text-soft hover:text-text hover:bg-white/5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Saved For Later Section */}
      {savedCartItems.length > 0 && (
        <div className="pt-6 space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-text">
            Saved for Later ({savedCartItems.length})
          </h2>
          <div className="space-y-3">
            {savedCartItems.map((item) => (
              <div
                key={item.id}
                className="nocturne-surface rounded-xl p-4 flex items-center justify-between gap-4 opacity-90"
              >
                <div>
                  <p className="text-sm font-semibold text-text">{item.foodName}</p>
                  <p className="text-xs text-text-muted font-mono-tabular">
                    {item.selectedSize} · ${item.unitFinalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onUpdateCartItem(item.id, { savedForLater: false })}
                    className="text-xs px-3 py-1.5"
                  >
                    Move to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCartItem(item.id)}
                    className="p-1.5 text-danger hover:text-danger hover:bg-danger/10"
                    aria-label={`Remove ${item.foodName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
