import type { Request, Response } from 'express';
import { FoodModel, CategoryModel, ReviewModel } from '../models/mongooseSchemas.ts';
import { sanitizeString, generateEntityId } from '../utils/security.ts';
import { validateFoodInput } from '../validators/index.ts';
import { IMG_PLATTER } from '../services/seedData.ts';
import type { Food, Category } from '../models/types.ts';

export async function getFoods(req: Request, res: Response) {
  const {
    category,
    search,
    veg,
    sort,
    featured,
    popular,
    includeUnavailable,
  } = req.query;

  const filter: Record<string, any> = {};

  if (includeUnavailable !== 'true') {
    filter.isAvailable = true;
  }

  if (category && typeof category === 'string' && category !== 'All') {
    filter.$or = [
      { categoryName: new RegExp(`^${category}$`, 'i') },
      { categoryId: category },
    ];
  }

  if (veg === 'veg') {
    filter.isVeg = true;
  } else if (veg === 'non-veg') {
    filter.isVeg = false;
  }

  if (featured === 'true') {
    filter.isFeatured = true;
  }

  if (popular === 'true') {
    filter.isPopular = true;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { name: regex },
      { categoryName: regex },
      { description: regex },
      { ingredients: regex },
      { dietaryTags: regex },
    ];
  }

  const list = (await FoodModel.find(filter).lean()) as unknown as Food[];

  if (sort === 'price-asc') {
    list.sort(
      (a, b) =>
        a.price * (1 - a.discountPercent / 100) -
        b.price * (1 - b.discountPercent / 100)
    );
  } else if (sort === 'price-desc') {
    list.sort(
      (a, b) =>
        b.price * (1 - b.discountPercent / 100) -
        a.price * (1 - a.discountPercent / 100)
    );
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }

  return res.json({ success: true, foods: list });
}

export async function getFoodById(req: Request, res: Response) {
  const { id } = req.params;
  const food = (await FoodModel.findOne({
    $or: [{ id }, { slug: id }],
  }).lean()) as unknown as Food | null;

  if (!food) {
    return res.status(404).json({
      success: false,
      message: 'Dish not found.',
      error: 'Dish not found.',
    });
  }

  const reviews = await ReviewModel.find({
    foodId: food.id,
    status: 'PUBLISHED',
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, food, reviews });
}

export async function createFood(req: Request, res: Response) {
  const validation = validateFoodInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const name = sanitizeString(req.body.name, 120);
  const categoryName = sanitizeString(req.body.categoryName, 80);
  const categoryObj = (await CategoryModel.findOne({
    name: new RegExp(`^${categoryName}$`, 'i'),
  }).lean()) as unknown as Category | null;

  const newFood: Food = {
    id: generateEntityId('food'),
    name,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${generateEntityId('f').slice(-6)}`,
    categoryId: categoryObj ? categoryObj.id : 'cat-mains',
    categoryName: categoryObj ? categoryObj.name : categoryName,
    description: sanitizeString(
      req.body.description ||
        'Artisanal chef creation crafted with seasonal ingredients.',
      500
    ),
    price: Number(req.body.price),
    discountPercent: Math.min(80, Math.max(0, Number(req.body.discountPercent || 0))),
    image: sanitizeString(req.body.image, 400) || IMG_PLATTER,
    illustrationType: req.body.illustrationType || 'platter',
    isVeg: Boolean(req.body.isVeg),
    spicyLevel: Math.min(3, Math.max(0, Number(req.body.spicyLevel || 0))) as 0 | 1 | 2 | 3,
    rating: 4.9,
    reviewCount: 1,
    calories: Math.max(0, Number(req.body.calories || 580)),
    prepTimeMinutes: Math.max(1, Number(req.body.prepTimeMinutes || 20)),
    ingredients: Array.isArray(req.body.ingredients)
      ? req.body.ingredients.map((i: unknown) => sanitizeString(i, 60)).filter(Boolean)
      : String(req.body.ingredients || 'Seasonal Produce, Artisanal Herbs')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
    dietaryTags: Array.isArray(req.body.dietaryTags)
      ? req.body.dietaryTags.map((t: unknown) => sanitizeString(t, 40)).filter(Boolean)
      : String(req.body.dietaryTags || 'Chef Signature')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
    isPopular: Boolean(req.body.isPopular),
    isFeatured: Boolean(req.body.isFeatured),
    isNewDish: req.body.isNewDish !== undefined ? Boolean(req.body.isNewDish) : true,
    isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
    sizes: [
      { name: 'Regular', priceDelta: 0, serves: 'Serves 1' },
      { name: 'Large', priceDelta: 8, serves: 'Serves 2' },
      { name: 'Family', priceDelta: 18, serves: 'Serves 3–4' },
    ],
    addons: [
      { id: 'addon-truffle', name: 'Shaved Périgord Black Truffle (4g)', price: 9, isVeg: true },
      { id: 'addon-cheese', name: '24-Month Aged Parmigiano Reggiano', price: 4, isVeg: true },
    ],
    createdAt: new Date().toISOString(),
  };

  await FoodModel.create(newFood);
  return res.status(201).json({ success: true, food: newFood });
}

export async function updateFood(req: Request, res: Response) {
  const { id } = req.params;
  const existing = (await FoodModel.findOne({ id }).lean()) as unknown as Food | null;
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Dish not found.',
      error: 'Dish not found.',
    });
  }

  const body = req.body || {};
  if (body.price !== undefined && (Number.isNaN(Number(body.price)) || Number(body.price) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number.',
      error: 'Price must be a positive number.',
    });
  }

  const updateFields: Partial<Food> = {};
  if (body.name !== undefined) updateFields.name = sanitizeString(body.name, 120);
  if (body.categoryName !== undefined) updateFields.categoryName = sanitizeString(body.categoryName, 80);
  if (body.description !== undefined) updateFields.description = sanitizeString(body.description, 500);
  if (body.price !== undefined) updateFields.price = Number(body.price);
  if (body.discountPercent !== undefined) updateFields.discountPercent = Math.min(90, Math.max(0, Number(body.discountPercent)));
  if (body.image !== undefined && String(body.image).trim()) updateFields.image = sanitizeString(body.image, 400);
  if (body.isVeg !== undefined) updateFields.isVeg = Boolean(body.isVeg);
  if (body.spicyLevel !== undefined) updateFields.spicyLevel = Math.min(3, Math.max(0, Number(body.spicyLevel))) as 0 | 1 | 2 | 3;
  if (body.calories !== undefined) updateFields.calories = Math.max(0, Number(body.calories));
  if (body.prepTimeMinutes !== undefined) updateFields.prepTimeMinutes = Math.max(1, Number(body.prepTimeMinutes));
  if (body.isPopular !== undefined) updateFields.isPopular = Boolean(body.isPopular);
  if (body.isFeatured !== undefined) updateFields.isFeatured = Boolean(body.isFeatured);
  if (body.isNewDish !== undefined) updateFields.isNewDish = Boolean(body.isNewDish);
  if (body.isAvailable !== undefined) updateFields.isAvailable = Boolean(body.isAvailable);
  if (body.ingredients !== undefined) {
    updateFields.ingredients = Array.isArray(body.ingredients)
      ? body.ingredients
      : String(body.ingredients).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (body.dietaryTags !== undefined) {
    updateFields.dietaryTags = Array.isArray(body.dietaryTags)
      ? body.dietaryTags
      : String(body.dietaryTags).split(',').map((s) => s.trim()).filter(Boolean);
  }

  const updated = (await FoodModel.findOneAndUpdate(
    { id },
    { $set: updateFields },
    { new: true }
  ).lean()) as unknown as Food;

  return res.json({ success: true, food: updated });
}

export async function deleteFood(req: Request, res: Response) {
  const { id } = req.params;
  const result = await FoodModel.deleteOne({ id });
  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Dish not found.',
      error: 'Dish not found.',
    });
  }
  return res.json({ success: true, message: 'Dish deleted successfully.' });
}

export async function getCategories(_req: Request, res: Response) {
  const categories = (await CategoryModel.find().lean()) as unknown as Category[];
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const dishCount = await FoodModel.countDocuments({
        $or: [
          { categoryName: new RegExp(`^${cat.name}$`, 'i') },
          { categoryId: cat.id },
        ],
        isAvailable: true,
      });
      return {
        ...cat,
        dishCount,
      };
    })
  );
  return res.json({ success: true, categories: categoriesWithCount });
}

export async function createCategory(req: Request, res: Response) {
  const name = sanitizeString(req.body?.name, 60);
  const description = sanitizeString(
    req.body?.description || 'Curated culinary collection',
    200
  );
  if (!name || name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required (min 2 chars).',
      error: 'Category name is required (min 2 chars).',
    });
  }
  const duplicate = await CategoryModel.findOne({
    name: new RegExp(`^${name}$`, 'i'),
  }).lean();
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: 'Category with this name already exists.',
      error: 'Category with this name already exists.',
    });
  }
  const newCat: Category = {
    id: generateEntityId('cat'),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    iconName: sanitizeString(req.body?.iconName || 'Utensils', 40),
  };

  await CategoryModel.create(newCat);
  return res.status(201).json({ success: true, category: newCat });
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  await CategoryModel.deleteOne({ id });
  const remaining = await CategoryModel.find().lean();
  return res.json({ success: true, categories: remaining });
}
