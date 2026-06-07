import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load .env.local (Next.js convention)
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in environment");
  process.exit(1);
}

const SALT_ROUNDS = 12;

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected.\n");

  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");

  // ── Clean existing data ──
  console.log("Clearing existing data...");
  const collections = [
    "users",
    "categories",
    "productattributes",
    "productattributevalues",
    "banners",
  ];
  for (const col of collections) {
    try {
      await db.collection(col).deleteMany({});
    } catch {
      // collection might not exist yet
    }
  }
  console.log("Cleared.\n");

  // ═══════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Malik@1214", SALT_ROUNDS);

  await db.collection("users").insertOne({
    name: "Rehan",
    email: "shoprehan786@gmail.com",
    password: adminPassword,
    emailVerified: new Date(),
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("  Admin: shoprehan786@gmail.com\n");

  // ═══════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════
  console.log("Creating categories...");
  const categoryDocs = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets, devices and accessories",
      image: "",
      parent: null,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Men and women fashion apparel",
      image: "",
      parent: null,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Home essentials and kitchen tools",
      image: "",
      parent: null,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Sports gear and outdoor equipment",
      image: "",
      parent: null,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Skincare, makeup and grooming",
      image: "",
      parent: null,
      isActive: true,
      sortOrder: 4,
    },
  ].map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }));

  const categories = await db.collection("categories").insertMany(categoryDocs);
  const categoryIds = Object.values(categories.insertedIds);
  console.log(`  Created ${categories.insertedCount} categories`);

  // Subcategories
  const subCategoryDocs = [
    {
      name: "Mobile Phones",
      slug: "mobile-phones",
      description: "Smartphones and feature phones",
      image: "",
      parent: categoryIds[0],
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Laptops",
      slug: "laptops",
      description: "Notebooks and ultrabooks",
      image: "",
      parent: categoryIds[0],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Audio",
      slug: "audio",
      description: "Headphones, speakers and earbuds",
      image: "",
      parent: categoryIds[0],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Men's Fashion",
      slug: "mens-fashion",
      description: "Men's clothing and accessories",
      image: "",
      parent: categoryIds[1],
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Women's Fashion",
      slug: "womens-fashion",
      description: "Women's clothing and accessories",
      image: "",
      parent: categoryIds[1],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      description: "Kitchen tools and gadgets",
      image: "",
      parent: categoryIds[2],
      isActive: true,
      sortOrder: 0,
    },
  ].map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }));

  const subCategories = await db.collection("categories").insertMany(subCategoryDocs);
  console.log(`  Created ${subCategories.insertedCount} subcategories\n`);

  // ═══════════════════════════════════════
  // PRODUCT ATTRIBUTES
  // ═══════════════════════════════════════
  console.log("Creating product attributes...");
  const attrDocs = [
    { name: "Size", slug: "size", affectsPrice: true, affectsStock: true, affectsSku: true },
    { name: "Color", slug: "color", affectsPrice: false, affectsStock: true, affectsSku: true },
    { name: "Storage", slug: "storage", affectsPrice: true, affectsStock: true, affectsSku: true },
  ].map((a) => ({ ...a, createdAt: new Date(), updatedAt: new Date() }));

  const attrs = await db.collection("productattributes").insertMany(attrDocs);
  const attrIds = Object.values(attrs.insertedIds);
  console.log(`  Created ${attrs.insertedCount} attributes`);

  // Attribute Values
  const attrValueDocs = [
    // Sizes
    { attribute: attrIds[0], value: "S", slug: "s" },
    { attribute: attrIds[0], value: "M", slug: "m" },
    { attribute: attrIds[0], value: "L", slug: "l" },
    { attribute: attrIds[0], value: "XL", slug: "xl" },
    // Colors
    { attribute: attrIds[1], value: "Black", slug: "black" },
    { attribute: attrIds[1], value: "White", slug: "white" },
    { attribute: attrIds[1], value: "Red", slug: "red" },
    { attribute: attrIds[1], value: "Blue", slug: "blue" },
    // Storage
    { attribute: attrIds[2], value: "64GB", slug: "64gb" },
    { attribute: attrIds[2], value: "128GB", slug: "128gb" },
    { attribute: attrIds[2], value: "256GB", slug: "256gb" },
  ].map((v) => ({ ...v, createdAt: new Date(), updatedAt: new Date() }));

  const attrValues = await db.collection("productattributevalues").insertMany(attrValueDocs);
  console.log(`  Created ${attrValues.insertedCount} attribute values\n`);

  // ═══════════════════════════════════════
  // BANNERS
  // ═══════════════════════════════════════
  console.log("Creating banners...");
  const bannerDocs = [
    {
      title: "New Arrivals",
      subtitle: "Discover the latest products at unbeatable prices",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
      link: "/products",
      position: "hero",
      isActive: true,
      sortOrder: 0,
      startsAt: null,
      endsAt: null,
    },
    {
      title: "Summer Sale",
      subtitle: "Up to 50% off on selected items",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
      link: "/products?tag=sale",
      position: "hero",
      isActive: true,
      sortOrder: 1,
      startsAt: null,
      endsAt: null,
    },
    {
      title: "Free Shipping",
      subtitle: "On orders over Rs 3,000",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=200&fit=crop",
      link: "/products",
      position: "promotional",
      isActive: true,
      sortOrder: 0,
      startsAt: null,
      endsAt: null,
    },
  ].map((b) => ({ ...b, createdAt: new Date(), updatedAt: new Date() }));

  const banners = await db.collection("banners").insertMany(bannerDocs);
  console.log(`  Created ${banners.insertedCount} banners\n`);

  // ═══════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════
  console.log("═══════════════════════════════════════");
  console.log("Seed complete!");
  console.log("═══════════════════════════════════════");
  console.log(`  Users:        1 (admin)`);
  console.log(
    `  Categories:   ${categoryDocs.length + subCategoryDocs.length} (${categoryDocs.length} parent, ${subCategoryDocs.length} sub)`,
  );
  console.log(`  Attributes:   ${attrDocs.length} with ${attrValueDocs.length} values`);
  console.log(`  Products:     0`);
  console.log(`  Variants:     0`);
  console.log(`  Coupons:      0`);
  console.log(`  Banners:      ${bannerDocs.length}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
