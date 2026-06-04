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
  await mongoose.connect(MONGODB_URI);
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
    "products",
    "productvariants",
    "inventories",
    "coupons",
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
  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("Admin@123", SALT_ROUNDS);
  const customerPassword = await bcrypt.hash("Customer@123", SALT_ROUNDS);

  const users = await db.collection("users").insertMany([
    {
      name: "Admin User",
      email: "admin@dollarshop.pk",
      password: adminPassword,
      emailVerified: new Date(),
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Ali Ahmed",
      email: "ali@example.com",
      password: customerPassword,
      emailVerified: new Date(),
      role: "customer",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sara Khan",
      email: "sara@example.com",
      password: customerPassword,
      emailVerified: new Date(),
      role: "customer",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Usman Raza",
      email: "usman@example.com",
      password: customerPassword,
      emailVerified: null,
      role: "customer",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log(`  Created ${users.insertedCount} users`);
  console.log("  Admin: admin@dollarshop.pk / Admin@123");
  console.log("  Customer: ali@example.com / Customer@123\n");

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
  const subCatIds = Object.values(subCategories.insertedIds);
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
  const valIds = Object.values(attrValues.insertedIds);
  console.log(`  Created ${attrValues.insertedCount} attribute values\n`);

  // ═══════════════════════════════════════
  // PRODUCTS (Simple)
  // ═══════════════════════════════════════
  console.log("Creating products...");

  const simpleProducts = [
    {
      name: "Wireless Bluetooth Speaker",
      slug: "wireless-bluetooth-speaker",
      description:
        "Portable wireless speaker with deep bass, 10-hour battery life, and IPX5 water resistance. Perfect for outdoor use.",
      shortDescription: "Portable speaker with deep bass and 10hr battery",
      images: [
        {
          url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
          alt: "Wireless Bluetooth Speaker front view",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop",
          alt: "Wireless Bluetooth Speaker side view",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1558537348-c0f8e733989d?w=600&h=600&fit=crop",
          alt: "Wireless Bluetooth Speaker in use outdoors",
          sortOrder: 2,
        },
      ],
      category: subCatIds[2], // Audio
      type: "simple",
      basePrice: 3500,
      salePrice: 2999,
      sku: "SPK-BT-001",
      attributes: [],
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      tags: ["speaker", "bluetooth", "wireless", "audio"],
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description:
        "Double-wall vacuum insulated water bottle. Keeps drinks hot for 12 hours and cold for 24 hours.",
      shortDescription: "Insulated bottle — hot 12hrs, cold 24hrs",
      images: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
          alt: "Stainless Steel Water Bottle",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1523362628745-0c100fc988a4?w=600&h=600&fit=crop",
          alt: "Water Bottle close-up cap detail",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600&h=600&fit=crop",
          alt: "Water Bottle outdoor use",
          sortOrder: 2,
        },
      ],
      category: categoryIds[3], // Sports
      type: "simple",
      basePrice: 1200,
      salePrice: null,
      sku: "BTL-SS-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      tags: ["bottle", "steel", "sports"],
    },
    {
      name: "LED Desk Lamp",
      slug: "led-desk-lamp",
      description:
        "Adjustable LED desk lamp with 3 color temperatures and 10 brightness levels. USB charging port included.",
      shortDescription: "Adjustable desk lamp with USB port",
      images: [
        {
          url: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&h=600&fit=crop",
          alt: "LED Desk Lamp on desk",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&h=600&fit=crop",
          alt: "LED Desk Lamp illuminated",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop",
          alt: "LED Desk Lamp workspace setup",
          sortOrder: 2,
        },
      ],
      category: categoryIds[2], // Home & Kitchen
      type: "simple",
      basePrice: 2500,
      salePrice: 1999,
      sku: "LMP-LED-001",
      attributes: [],
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      tags: ["lamp", "led", "desk", "home"],
    },
    {
      name: "Vitamin C Face Serum",
      slug: "vitamin-c-face-serum",
      description:
        "Brightening face serum with 20% Vitamin C, Hyaluronic Acid, and Vitamin E. For all skin types.",
      shortDescription: "Brightening serum with 20% Vitamin C",
      images: [
        {
          url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
          alt: "Vitamin C Face Serum bottle",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop",
          alt: "Face Serum dropper close-up",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1570194065650-d99fb4ee21a4?w=600&h=600&fit=crop",
          alt: "Skincare products flat lay",
          sortOrder: 2,
        },
      ],
      category: categoryIds[4], // Beauty
      type: "simple",
      basePrice: 1800,
      salePrice: 1499,
      sku: "BEA-SRM-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      tags: ["skincare", "serum", "vitamin-c", "beauty"],
    },
    {
      name: "Non-Stick Frying Pan",
      slug: "non-stick-frying-pan",
      description:
        "Premium non-stick frying pan with granite coating. PFOA-free, suitable for all stovetops including induction.",
      shortDescription: "Granite-coated non-stick pan",
      images: [
        {
          url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop",
          alt: "Non-Stick Frying Pan top view",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&h=600&fit=crop",
          alt: "Frying Pan with food cooking",
          sortOrder: 1,
        },
      ],
      category: subCatIds[5], // Kitchen Appliances
      type: "simple",
      basePrice: 2200,
      salePrice: null,
      sku: "KIT-PAN-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      tags: ["kitchen", "cookware", "non-stick"],
    },
    {
      name: "Yoga Mat",
      slug: "yoga-mat",
      description:
        "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Eco-friendly TPE material.",
      shortDescription: "6mm thick non-slip yoga mat",
      images: [
        {
          url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
          alt: "Yoga Mat rolled up",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
          alt: "Yoga Mat in use during practice",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop",
          alt: "Yoga Mat with accessories",
          sortOrder: 2,
        },
      ],
      category: categoryIds[3], // Sports
      type: "simple",
      basePrice: 1500,
      salePrice: null,
      sku: "SPT-YOG-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      tags: ["yoga", "fitness", "mat", "sports"],
    },
  ].map((p) => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));

  const simpleResult = await db.collection("products").insertMany(simpleProducts);
  const simpleProductIds = Object.values(simpleResult.insertedIds);
  console.log(`  Created ${simpleResult.insertedCount} simple products`);

  // Inventory for simple products
  const simpleInventory = simpleProductIds.map((pid, i) => ({
    product: pid,
    variant: null,
    stock: [25, 50, 15, 40, 30, 20][i],
    lowStockThreshold: 5,
    sku: simpleProducts[i].sku,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.collection("inventories").insertMany(simpleInventory);
  console.log(`  Created ${simpleInventory.length} inventory records`);

  // ═══════════════════════════════════════
  // PRODUCTS (Variable)
  // ═══════════════════════════════════════

  // Variable Product 1: T-Shirt (Size + Color)
  const tshirtResult = await db.collection("products").insertOne({
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description:
      "Premium 100% combed cotton t-shirt with a relaxed fit. Pre-shrunk fabric ensures lasting comfort and shape.",
    shortDescription: "Premium cotton t-shirt with relaxed fit",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
        alt: "Classic Cotton T-Shirt front",
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
        alt: "Cotton T-Shirt folded",
        sortOrder: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop",
        alt: "Cotton T-Shirt on hanger",
        sortOrder: 2,
      },
    ],
    category: subCatIds[3], // Men's Fashion
    type: "variable",
    basePrice: 999,
    salePrice: null,
    sku: "CLO-TSH",
    attributes: [
      { attribute: attrIds[0], values: [valIds[0], valIds[1], valIds[2], valIds[3]] }, // S, M, L, XL
      { attribute: attrIds[1], values: [valIds[4], valIds[5], valIds[6]] }, // Black, White, Red
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["tshirt", "cotton", "men", "fashion"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // T-shirt variants
  const tshirtVariants: Record<string, unknown>[] = [];
  const sizes = [
    { id: valIds[0], label: "S" },
    { id: valIds[1], label: "M" },
    { id: valIds[2], label: "L" },
    { id: valIds[3], label: "XL" },
  ];
  const colors = [
    { id: valIds[4], label: "Black" },
    { id: valIds[5], label: "White" },
    { id: valIds[6], label: "Red" },
  ];

  const tshirtStocks: number[] = [];
  for (const size of sizes) {
    for (const color of colors) {
      const stock = Math.floor(Math.random() * 20) + 5;
      tshirtStocks.push(stock);
      tshirtVariants.push({
        product: tshirtResult.insertedId,
        attributes: [
          { attribute: attrIds[0], value: size.id },
          { attribute: attrIds[1], value: color.id },
        ],
        price: size.label === "XL" ? 1199 : 999,
        salePrice: null,
        sku: `CLO-TSH-${size.label}-${color.label.substring(0, 3).toUpperCase()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  const tshirtVarResult = await db.collection("productvariants").insertMany(tshirtVariants);
  const tshirtVarIds = Object.values(tshirtVarResult.insertedIds);
  await db.collection("inventories").insertMany(
    tshirtVarIds.map((vid, i) => ({
      product: tshirtResult.insertedId,
      variant: vid,
      stock: tshirtStocks[i],
      lowStockThreshold: 5,
      sku: tshirtVariants[i].sku,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );
  console.log(`  Created T-Shirt with ${tshirtVariants.length} variants`);

  // Variable Product 2: Smartphone (Storage + Color)
  const phoneResult = await db.collection("products").insertOne({
    name: "Galaxy Pro Max Smartphone",
    slug: "galaxy-pro-max-smartphone",
    description:
      'Flagship smartphone with 6.7" AMOLED display, 108MP camera, 5000mAh battery, and 5G connectivity.',
    shortDescription: '6.7" AMOLED, 108MP camera, 5G',
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
        alt: "Galaxy Pro Max Smartphone front",
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
        alt: "Smartphone rear camera view",
        sortOrder: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=600&fit=crop",
        alt: "Smartphone in hand",
        sortOrder: 2,
      },
    ],
    category: subCatIds[0], // Mobile Phones
    type: "variable",
    basePrice: 85000,
    salePrice: null,
    sku: "PHN-GPM",
    attributes: [
      { attribute: attrIds[2], values: [valIds[8], valIds[9], valIds[10]] }, // 64GB, 128GB, 256GB
      { attribute: attrIds[1], values: [valIds[4], valIds[5], valIds[7]] }, // Black, White, Blue
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    tags: ["phone", "smartphone", "5g", "android"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const storages = [
    { id: valIds[8], label: "64GB", priceAdd: 0 },
    { id: valIds[9], label: "128GB", priceAdd: 10000 },
    { id: valIds[10], label: "256GB", priceAdd: 20000 },
  ];
  const phoneColors = [
    { id: valIds[4], label: "Black" },
    { id: valIds[5], label: "White" },
    { id: valIds[7], label: "Blue" },
  ];

  const phoneVariants: Record<string, unknown>[] = [];
  const phoneStocks: number[] = [];
  for (const storage of storages) {
    for (const color of phoneColors) {
      const stock = Math.floor(Math.random() * 10) + 2;
      phoneStocks.push(stock);
      phoneVariants.push({
        product: phoneResult.insertedId,
        attributes: [
          { attribute: attrIds[2], value: storage.id },
          { attribute: attrIds[1], value: color.id },
        ],
        price: 85000 + storage.priceAdd,
        salePrice: storage.label === "128GB" ? 89999 : null,
        sku: `PHN-GPM-${storage.label}-${color.label.substring(0, 3).toUpperCase()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  const phoneVarResult = await db.collection("productvariants").insertMany(phoneVariants);
  const phoneVarIds = Object.values(phoneVarResult.insertedIds);
  await db.collection("inventories").insertMany(
    phoneVarIds.map((vid, i) => ({
      product: phoneResult.insertedId,
      variant: vid,
      stock: phoneStocks[i],
      lowStockThreshold: 5,
      sku: phoneVariants[i].sku,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );
  console.log(`  Created Smartphone with ${phoneVariants.length} variants`);

  // Variable Product 3: Running Shoes (Size + Color)
  const shoesResult = await db.collection("products").insertOne({
    name: "ProRunner Athletic Shoes",
    slug: "prorunner-athletic-shoes",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily training and races.",
    shortDescription: "Lightweight with responsive cushioning",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
        alt: "ProRunner Athletic Shoes side view",
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
        alt: "Running Shoes pair top view",
        sortOrder: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
        alt: "Athletic Shoes close-up detail",
        sortOrder: 2,
      },
    ],
    category: categoryIds[3], // Sports
    type: "variable",
    basePrice: 5500,
    salePrice: 4999,
    sku: "SPT-RUN",
    attributes: [
      { attribute: attrIds[0], values: [valIds[1], valIds[2], valIds[3]] }, // M(40), L(42), XL(44)
      { attribute: attrIds[1], values: [valIds[4], valIds[5], valIds[7]] }, // Black, White, Blue
    ],
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    tags: ["shoes", "running", "sports", "athletic"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shoeSizes = [
    { id: valIds[1], label: "40" },
    { id: valIds[2], label: "42" },
    { id: valIds[3], label: "44" },
  ];
  const shoeColors = [
    { id: valIds[4], label: "Black" },
    { id: valIds[5], label: "White" },
    { id: valIds[7], label: "Blue" },
  ];

  const shoeVariants: Record<string, unknown>[] = [];
  const shoeStocks: number[] = [];
  for (const size of shoeSizes) {
    for (const color of shoeColors) {
      const stock = Math.floor(Math.random() * 15) + 3;
      shoeStocks.push(stock);
      shoeVariants.push({
        product: shoesResult.insertedId,
        attributes: [
          { attribute: attrIds[0], value: size.id },
          { attribute: attrIds[1], value: color.id },
        ],
        price: size.label === "44" ? 5999 : 5500,
        salePrice: size.label === "44" ? 5499 : 4999,
        sku: `SPT-RUN-${size.label}-${color.label.substring(0, 3).toUpperCase()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  const shoeVarResult = await db.collection("productvariants").insertMany(shoeVariants);
  const shoeVarIds = Object.values(shoeVarResult.insertedIds);
  await db.collection("inventories").insertMany(
    shoeVarIds.map((vid, i) => ({
      product: shoesResult.insertedId,
      variant: vid,
      stock: shoeStocks[i],
      lowStockThreshold: 5,
      sku: shoeVariants[i].sku,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );
  console.log(`  Created Running Shoes with ${shoeVariants.length} variants\n`);

  // ═══════════════════════════════════════
  // COUPONS
  // ═══════════════════════════════════════
  console.log("Creating coupons...");
  const couponDocs = [
    {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minPurchase: 1000,
      maxDiscount: 500,
      maxUses: null,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    {
      code: "FLAT500",
      type: "fixed",
      value: 500,
      minPurchase: 3000,
      maxDiscount: null,
      maxUses: 100,
      usedCount: 12,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      code: "SUMMER25",
      type: "percentage",
      value: 25,
      minPurchase: 5000,
      maxDiscount: 2000,
      maxUses: 50,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
      code: "EXPIRED20",
      type: "percentage",
      value: 20,
      minPurchase: 0,
      maxDiscount: null,
      maxUses: null,
      usedCount: 45,
      isActive: true,
      expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // expired 7 days ago
    },
  ].map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }));

  const coupons = await db.collection("coupons").insertMany(couponDocs);
  console.log(`  Created ${coupons.insertedCount} coupons\n`);

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
  console.log(`  Users:        4 (1 admin, 3 customers)`);
  console.log(
    `  Categories:   ${categoryDocs.length + subCategoryDocs.length} (${categoryDocs.length} parent, ${subCategoryDocs.length} sub)`,
  );
  console.log(`  Attributes:   ${attrDocs.length} with ${attrValueDocs.length} values`);
  console.log(
    `  Products:     ${simpleProducts.length + 3} (${simpleProducts.length} simple, 3 variable)`,
  );
  console.log(
    `  Variants:     ${tshirtVariants.length + phoneVariants.length + shoeVariants.length}`,
  );
  console.log(`  Coupons:      ${couponDocs.length}`);
  console.log(`  Banners:      ${bannerDocs.length}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
