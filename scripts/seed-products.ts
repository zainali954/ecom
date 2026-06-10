import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in environment");
  process.exit(1);
}

async function seedProducts() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected.\n");

  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");

  // ── Load existing categories and attributes ──
  const categories = await db.collection("categories").find({}).toArray();
  const attrs = await db.collection("productattributes").find({}).toArray();
  const attrValues = await db.collection("productattributevalues").find({}).toArray();

  const cat = (slug: string) => {
    const c = categories.find((c) => c.slug === slug);
    if (!c) throw new Error(`Category "${slug}" not found. Run npm run seed first.`);
    return c._id;
  };

  const attr = (slug: string) => {
    const a = attrs.find((a) => a.slug === slug);
    if (!a) throw new Error(`Attribute "${slug}" not found.`);
    return a._id;
  };

  const attrVal = (attrSlug: string, valueSlug: string) => {
    const a = attrs.find((a) => a.slug === attrSlug);
    if (!a) throw new Error(`Attribute "${attrSlug}" not found.`);
    const v = attrValues.find(
      (v) => v.attribute.toString() === a._id.toString() && v.slug === valueSlug,
    );
    if (!v) throw new Error(`Attribute value "${attrSlug}:${valueSlug}" not found.`);
    return v._id;
  };

  // ── Clean products, variants, inventory ──
  console.log("Clearing existing products, variants, and inventory...");
  for (const col of ["products", "productvariants", "inventories"]) {
    try {
      await db.collection(col).deleteMany({});
    } catch {
      // collection might not exist
    }
  }
  console.log("Cleared.\n");

  const now = new Date();

  // ═══════════════════════════════════════
  // SIMPLE PRODUCTS (no variants)
  // ═══════════════════════════════════════
  console.log("Creating simple products...");
  const simpleProducts = [
    {
      name: "Wireless Bluetooth Speaker",
      slug: "wireless-bluetooth-speaker",
      description:
        "Portable wireless speaker with deep bass and 12-hour battery life. IPX5 water resistant, perfect for outdoor use.",
      shortDescription: "Portable speaker with deep bass and 12hr battery",
      images: [
        {
          url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
          alt: "Bluetooth Speaker",
          sortOrder: 0,
        },
      ],
      category: cat("audio"),
      type: "simple",
      basePrice: 4500,
      salePrice: 3500,
      sku: "SPK-BT-001",
      attributes: [],
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      tags: ["speaker", "bluetooth", "wireless", "portable"],
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description:
        "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours and hot for 12 hours. BPA-free, 750ml capacity.",
      shortDescription: "Vacuum insulated 750ml bottle, hot & cold",
      images: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
          alt: "Water Bottle",
          sortOrder: 0,
        },
      ],
      category: cat("sports-outdoors"),
      type: "simple",
      basePrice: 1800,
      salePrice: 1499,
      sku: "BTL-SS-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      tags: ["bottle", "sports", "outdoor", "steel"],
    },
    {
      name: "LED Desk Lamp",
      slug: "led-desk-lamp",
      description:
        "Adjustable LED desk lamp with 3 color modes and 10 brightness levels. Touch control, USB charging port, eye-care technology.",
      shortDescription: "Adjustable LED lamp with USB charging",
      images: [
        {
          url: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop",
          alt: "LED Desk Lamp",
          sortOrder: 0,
        },
      ],
      category: cat("home-kitchen"),
      type: "simple",
      basePrice: 3200,
      salePrice: null,
      sku: "LMP-LED-001",
      attributes: [],
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      tags: ["lamp", "led", "desk", "home"],
    },
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description:
        "Extra thick 6mm yoga mat with alignment lines. Non-slip surface, eco-friendly TPE material. Includes carry strap.",
      shortDescription: "6mm thick non-slip yoga mat with carry strap",
      images: [
        {
          url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
          alt: "Yoga Mat",
          sortOrder: 0,
        },
      ],
      category: cat("sports-outdoors"),
      type: "simple",
      basePrice: 2500,
      salePrice: 1999,
      sku: "YGA-MAT-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      tags: ["yoga", "fitness", "mat", "exercise"],
    },
    {
      name: "Ceramic Coffee Mug Set",
      slug: "ceramic-coffee-mug-set",
      description:
        "Set of 4 premium ceramic mugs, 350ml each. Microwave and dishwasher safe. Matte finish with modern design.",
      shortDescription: "Set of 4 ceramic mugs, 350ml, matte finish",
      images: [
        {
          url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
          alt: "Coffee Mugs",
          sortOrder: 0,
        },
      ],
      category: cat("kitchen-appliances"),
      type: "simple",
      basePrice: 1600,
      salePrice: null,
      sku: "MUG-CRM-004",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      tags: ["mug", "kitchen", "ceramic", "coffee"],
    },
    {
      name: "Moisturizing Face Cream",
      slug: "moisturizing-face-cream",
      description:
        "Hydrating face cream with hyaluronic acid and vitamin E. Suitable for all skin types. 50ml jar.",
      shortDescription: "Hydrating cream with hyaluronic acid, 50ml",
      images: [
        {
          url: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=600&h=600&fit=crop",
          alt: "Face Cream",
          sortOrder: 0,
        },
      ],
      category: cat("beauty-personal-care"),
      type: "simple",
      basePrice: 1200,
      salePrice: 999,
      sku: "BCR-FC-001",
      attributes: [],
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      tags: ["skincare", "cream", "moisturizer", "beauty"],
    },
    {
      name: "USB-C Fast Charger 65W",
      slug: "usb-c-fast-charger-65w",
      description:
        "65W GaN USB-C fast charger compatible with laptops, phones, and tablets. Compact foldable plug design.",
      shortDescription: "65W GaN charger, laptops & phones",
      images: [
        {
          url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop",
          alt: "USB-C Charger",
          sortOrder: 0,
        },
      ],
      category: cat("electronics"),
      type: "simple",
      basePrice: 3800,
      salePrice: 2999,
      sku: "CHG-65W-001",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      tags: ["charger", "usb-c", "fast-charging", "electronics"],
    },
    {
      name: "Bamboo Cutting Board Set",
      slug: "bamboo-cutting-board-set",
      description:
        "Set of 3 organic bamboo cutting boards in different sizes. Knife-friendly, naturally antimicrobial.",
      shortDescription: "Set of 3 bamboo boards, antimicrobial",
      images: [
        {
          url: "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=600&fit=crop",
          alt: "Cutting Board",
          sortOrder: 0,
        },
      ],
      category: cat("kitchen-appliances"),
      type: "simple",
      basePrice: 2200,
      salePrice: null,
      sku: "KIT-CB-003",
      attributes: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      tags: ["kitchen", "bamboo", "cutting-board", "eco-friendly"],
    },
  ].map((p) => ({ ...p, createdAt: now, updatedAt: now }));

  const simpleResult = await db.collection("products").insertMany(simpleProducts);
  const simpleIds = Object.values(simpleResult.insertedIds);
  console.log(`  Created ${simpleResult.insertedCount} simple products`);

  // Inventory for simple products
  const simpleInventory = simpleIds.map((id, i) => ({
    product: id,
    variant: null,
    stock: [50, 30, 25, 40, 60, 35, 45, 20][i] ?? 30,
    lowStockThreshold: 5,
    sku: simpleProducts[i].sku,
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection("inventories").insertMany(simpleInventory);
  console.log(`  Created ${simpleInventory.length} inventory records\n`);

  // ═══════════════════════════════════════
  // VARIABLE PRODUCTS (with variants)
  // ═══════════════════════════════════════
  console.log("Creating variable products...");

  // ── 1. Classic Cotton T-Shirt (Size + Color) ──
  const tshirtProduct = {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description:
      "Premium 100% combed cotton t-shirt with a relaxed fit. Pre-shrunk fabric, reinforced stitching at seams. Available in multiple sizes and colors.",
    shortDescription: "100% cotton tee, relaxed fit, multiple colors",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
        alt: "Cotton T-Shirt",
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
        alt: "Cotton T-Shirt Back",
        sortOrder: 1,
      },
    ],
    category: cat("mens-fashion"),
    type: "variable",
    basePrice: 1200,
    salePrice: 999,
    sku: "TSH-COT",
    attributes: [
      {
        attribute: attr("size"),
        values: [
          attrVal("size", "s"),
          attrVal("size", "m"),
          attrVal("size", "l"),
          attrVal("size", "xl"),
        ],
      },
      {
        attribute: attr("color"),
        values: [attrVal("color", "black"), attrVal("color", "white"), attrVal("color", "blue")],
      },
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["tshirt", "cotton", "mens", "fashion"],
    createdAt: now,
    updatedAt: now,
  };

  const tshirtResult = await db.collection("products").insertOne(tshirtProduct);
  const tshirtId = tshirtResult.insertedId;

  const tshirtSizes = ["s", "m", "l", "xl"] as const;
  const tshirtColors = ["black", "white", "blue"] as const;
  const tshirtVariants = [];
  const tshirtInventory = [];

  for (const size of tshirtSizes) {
    for (const color of tshirtColors) {
      const sku = `TSH-COT-${size.toUpperCase()}-${color.toUpperCase().slice(0, 3)}`;
      const variant = {
        product: tshirtId,
        attributes: [
          { attribute: attr("size"), value: attrVal("size", size) },
          { attribute: attr("color"), value: attrVal("color", color) },
        ],
        price: size === "xl" ? 1400 : 1200,
        salePrice: size === "xl" ? 1199 : 999,
        sku,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      tshirtVariants.push(variant);
    }
  }

  const tshirtVarResult = await db.collection("productvariants").insertMany(tshirtVariants);
  const tshirtVarIds = Object.values(tshirtVarResult.insertedIds);

  for (let i = 0; i < tshirtVarIds.length; i++) {
    tshirtInventory.push({
      product: tshirtId,
      variant: tshirtVarIds[i],
      stock: 15 + Math.floor(Math.random() * 30),
      lowStockThreshold: 5,
      sku: tshirtVariants[i].sku,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.collection("inventories").insertMany(tshirtInventory);
  console.log(`  T-Shirt: ${tshirtVarResult.insertedCount} variants`);

  // ── 2. Smartphone Pro Max (Storage + Color) ──
  const phoneProduct = {
    name: "Smartphone Pro Max",
    slug: "smartphone-pro-max",
    description:
      'Flagship smartphone with 6.7" AMOLED display, triple camera system (108MP + 12MP + 5MP), 5000mAh battery, 5G enabled.',
    shortDescription: '6.7" AMOLED, 108MP camera, 5G, 5000mAh',
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
        alt: "Smartphone Front",
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
        alt: "Smartphone Back",
        sortOrder: 1,
      },
    ],
    category: cat("mobile-phones"),
    type: "variable",
    basePrice: 89999,
    salePrice: 79999,
    sku: "PHN-PRO",
    attributes: [
      {
        attribute: attr("storage"),
        values: [attrVal("storage", "128gb"), attrVal("storage", "256gb")],
      },
      { attribute: attr("color"), values: [attrVal("color", "black"), attrVal("color", "white")] },
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["smartphone", "5g", "flagship", "mobile"],
    createdAt: now,
    updatedAt: now,
  };

  const phoneResult = await db.collection("products").insertOne(phoneProduct);
  const phoneId = phoneResult.insertedId;

  const storageOptions = [
    { slug: "128gb", priceAdd: 0 },
    { slug: "256gb", priceAdd: 15000 },
  ];
  const phoneColors = ["black", "white"] as const;
  const phoneVariants = [];
  const phoneInventory = [];

  for (const storage of storageOptions) {
    for (const color of phoneColors) {
      const sku = `PHN-PRO-${storage.slug.toUpperCase()}-${color.toUpperCase().slice(0, 3)}`;
      phoneVariants.push({
        product: phoneId,
        attributes: [
          { attribute: attr("storage"), value: attrVal("storage", storage.slug) },
          { attribute: attr("color"), value: attrVal("color", color) },
        ],
        price: 89999 + storage.priceAdd,
        salePrice: 79999 + storage.priceAdd,
        sku,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const phoneVarResult = await db.collection("productvariants").insertMany(phoneVariants);
  const phoneVarIds = Object.values(phoneVarResult.insertedIds);

  for (let i = 0; i < phoneVarIds.length; i++) {
    phoneInventory.push({
      product: phoneId,
      variant: phoneVarIds[i],
      stock: 10 + Math.floor(Math.random() * 20),
      lowStockThreshold: 3,
      sku: phoneVariants[i].sku,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.collection("inventories").insertMany(phoneInventory);
  console.log(`  Smartphone: ${phoneVarResult.insertedCount} variants`);

  // ── 3. Women's Casual Dress (Size + Color) ──
  const dressProduct = {
    name: "Women's Casual Summer Dress",
    slug: "womens-casual-summer-dress",
    description:
      "Lightweight floral summer dress with adjustable straps. Breathable cotton-blend fabric, knee-length, side pockets.",
    shortDescription: "Lightweight floral dress, breathable cotton-blend",
    images: [
      {
        url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop",
        alt: "Summer Dress",
        sortOrder: 0,
      },
    ],
    category: cat("womens-fashion"),
    type: "variable",
    basePrice: 2800,
    salePrice: 2299,
    sku: "DRS-SUM",
    attributes: [
      {
        attribute: attr("size"),
        values: [attrVal("size", "s"), attrVal("size", "m"), attrVal("size", "l")],
      },
      {
        attribute: attr("color"),
        values: [attrVal("color", "red"), attrVal("color", "blue"), attrVal("color", "white")],
      },
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    tags: ["dress", "summer", "womens", "casual"],
    createdAt: now,
    updatedAt: now,
  };

  const dressResult = await db.collection("products").insertOne(dressProduct);
  const dressId = dressResult.insertedId;

  const dressSizes = ["s", "m", "l"] as const;
  const dressColors = ["red", "blue", "white"] as const;
  const dressVariants = [];
  const dressInventory = [];

  for (const size of dressSizes) {
    for (const color of dressColors) {
      const sku = `DRS-SUM-${size.toUpperCase()}-${color.toUpperCase().slice(0, 3)}`;
      dressVariants.push({
        product: dressId,
        attributes: [
          { attribute: attr("size"), value: attrVal("size", size) },
          { attribute: attr("color"), value: attrVal("color", color) },
        ],
        price: 2800,
        salePrice: 2299,
        sku,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const dressVarResult = await db.collection("productvariants").insertMany(dressVariants);
  const dressVarIds = Object.values(dressVarResult.insertedIds);

  for (let i = 0; i < dressVarIds.length; i++) {
    dressInventory.push({
      product: dressId,
      variant: dressVarIds[i],
      stock: 10 + Math.floor(Math.random() * 25),
      lowStockThreshold: 5,
      sku: dressVariants[i].sku,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.collection("inventories").insertMany(dressInventory);
  console.log(`  Dress: ${dressVarResult.insertedCount} variants`);

  // ── 4. Wireless Earbuds Pro (Color only) ──
  const earbudsProduct = {
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    description:
      "True wireless earbuds with active noise cancellation. 30-hour total battery life with charging case. IPX4 sweat resistant.",
    shortDescription: "ANC earbuds, 30hr battery, IPX4",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop",
        alt: "Wireless Earbuds",
        sortOrder: 0,
      },
    ],
    category: cat("audio"),
    type: "variable",
    basePrice: 7500,
    salePrice: 5999,
    sku: "EAR-PRO",
    attributes: [
      { attribute: attr("color"), values: [attrVal("color", "black"), attrVal("color", "white")] },
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["earbuds", "wireless", "anc", "audio"],
    createdAt: now,
    updatedAt: now,
  };

  const earbudsResult = await db.collection("products").insertOne(earbudsProduct);
  const earbudsId = earbudsResult.insertedId;

  const earbudsColors = ["black", "white"] as const;
  const earbudsVariants = [];
  const earbudsInventory = [];

  for (const color of earbudsColors) {
    const sku = `EAR-PRO-${color.toUpperCase().slice(0, 3)}`;
    earbudsVariants.push({
      product: earbudsId,
      attributes: [{ attribute: attr("color"), value: attrVal("color", color) }],
      price: 7500,
      salePrice: 5999,
      sku,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const earbudsVarResult = await db.collection("productvariants").insertMany(earbudsVariants);
  const earbudsVarIds = Object.values(earbudsVarResult.insertedIds);

  for (let i = 0; i < earbudsVarIds.length; i++) {
    earbudsInventory.push({
      product: earbudsId,
      variant: earbudsVarIds[i],
      stock: 25 + Math.floor(Math.random() * 20),
      lowStockThreshold: 5,
      sku: earbudsVariants[i].sku,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.collection("inventories").insertMany(earbudsInventory);
  console.log(`  Earbuds: ${earbudsVarResult.insertedCount} variants`);

  // ── 5. Laptop UltraBook (Storage only) ──
  const laptopProduct = {
    name: "UltraBook Pro 15",
    slug: "ultrabook-pro-15",
    description:
      'Ultra-thin 15.6" FHD laptop with Intel i7, 16GB RAM, backlit keyboard, fingerprint reader. All-day 10hr battery life.',
    shortDescription: '15.6" i7 laptop, 16GB RAM, 10hr battery',
    images: [
      {
        url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop",
        alt: "Laptop",
        sortOrder: 0,
      },
    ],
    category: cat("laptops"),
    type: "variable",
    basePrice: 145000,
    salePrice: null,
    sku: "LPT-UB15",
    attributes: [
      {
        attribute: attr("storage"),
        values: [attrVal("storage", "256gb"), attrVal("storage", "64gb")],
      },
    ],
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    tags: ["laptop", "ultrabook", "intel", "portable"],
    createdAt: now,
    updatedAt: now,
  };

  const laptopResult = await db.collection("products").insertOne(laptopProduct);
  const laptopId = laptopResult.insertedId;

  const laptopStorageOptions = [
    { slug: "256gb", label: "256GB SSD", price: 145000 },
    { slug: "64gb", label: "64GB SSD", price: 125000 },
  ];
  const laptopVariants = [];
  const laptopInventory = [];

  for (const storage of laptopStorageOptions) {
    const sku = `LPT-UB15-${storage.slug.toUpperCase()}`;
    laptopVariants.push({
      product: laptopId,
      attributes: [{ attribute: attr("storage"), value: attrVal("storage", storage.slug) }],
      price: storage.price,
      salePrice: null,
      sku,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const laptopVarResult = await db.collection("productvariants").insertMany(laptopVariants);
  const laptopVarIds = Object.values(laptopVarResult.insertedIds);

  for (let i = 0; i < laptopVarIds.length; i++) {
    laptopInventory.push({
      product: laptopId,
      variant: laptopVarIds[i],
      stock: 8 + Math.floor(Math.random() * 10),
      lowStockThreshold: 3,
      sku: laptopVariants[i].sku,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.collection("inventories").insertMany(laptopInventory);
  console.log(`  Laptop: ${laptopVarResult.insertedCount} variants\n`);

  // ═══════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════
  const totalVariants =
    tshirtVarResult.insertedCount +
    phoneVarResult.insertedCount +
    dressVarResult.insertedCount +
    earbudsVarResult.insertedCount +
    laptopVarResult.insertedCount;

  console.log("═══════════════════════════════════════");
  console.log("Product seed complete!");
  console.log("═══════════════════════════════════════");
  console.log(`  Simple products:   ${simpleResult.insertedCount}`);
  console.log(`  Variable products: 5`);
  console.log(`  Total variants:    ${totalVariants}`);
  console.log(`  Inventory records: ${simpleInventory.length + totalVariants}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seedProducts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
