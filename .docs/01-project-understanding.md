# Project Overview

## Project Name

DollarShop E-Commerce Platform

---

# Vision

Build a modern production-grade e-commerce platform focused on the Pakistan market.

The platform should provide:

- Customer storefront
- Product discovery
- Shopping cart
- Wishlist
- Checkout
- Order management
- User profile management
- Address management
- Inventory management
- Admin dashboard

---

# Tech Stack

Frontend:

- Next.js App Router
- TypeScript
- Shadcn UI
- TailwindCSS

Backend:

- Next.js Server Actions
- Route Handlers

Database:

- MongoDB
- Mongoose

Authentication:

- NextAuth

Email:

- Resend

File Storage:

- Cloudinary

Validation:

- Zod

State:

- Zustand

---

# User Roles

## Customer

Can:

- Register
- Login
- Logout
- Reset Password
- Browse Products
- Search Products
- Add To Cart
- Add To Wishlist
- Checkout
- Manage Addresses
- Manage Profile
- View Orders

---

## Admin

Can:

- Manage Users
- Manage Products
- Manage Categories
- Manage Inventory
- Manage Orders
- Manage Coupons
- Manage Banners
- Manage Settings

---

# Customer Pages

## Public Pages

### Home

Contains:

- Hero Carousel
- Featured Categories
- New Arrivals
- Best Sellers
- Trending Products
- Promotional Banners

---

### Categories Page

URL:

/categories

Displays:

- All Categories
- Category Cards

---

### Category Details

URL:

/category/[slug]

Displays:

- Category Banner
- Product Listing
- Filters
- Sorting

---

### Product Listing

URL:

/products

Displays:

- Grid View
- Search
- Filters
- Pagination

---

### Product Details

URL:

/product/[slug]

Contains:

- Product Images Gallery
- Product Information
- Variant Selection
- Add To Cart
- Wishlist
- Related Products
- Reviews

---

### Cart

URL:

/cart

Contains:

- Cart Items
- Quantity Controls
- Cart Summary

---

### Wishlist

URL:

/wishlist

Contains:

- Saved Products

---

# Customer Account

URL:

/account

Sections:

- Dashboard
- Profile
- Addresses
- Orders
- Security Settings

---

# Address Requirements

Pakistan Address Structure

Required Fields:

- Full Name
- Phone Number
- Alternate Phone Number
- Province
- City
- Area
- Address Line 1
- Address Line 2
- Postal Code
- Landmark

Supported Provinces:

- Punjab
- Sindh
- KPK
- Balochistan
- Gilgit Baltistan
- Azad Kashmir
- Islamabad Capital Territory

---

# Product Requirements

Products support:

- Simple Products
- Variable Products

---

# Variant System

Example:

Shoe

Size:

- 40
- 41
- 42
- 43

Size affects price.

Color:

- Red
- Black
- White

Color does NOT affect price.

System must support:

Price Dependent Attributes

Examples:

- Size
- Storage
- Weight

Price Independent Attributes

Examples:

- Color
- Material
- Style

Admin can configure whether an attribute affects:

- Price
- Stock
- SKU

---

# Order Flow

Customer:

Browse Product
→ Add To Cart
→ Checkout
→ Place Order
→ Payment
→ Confirmation

---

# Future Integrations Not finalize yet

Payments:

- JazzCash
- EasyPaisa

Shipping:

- TCS
- Leopards
- Call Courier

Notifications:

- Email
- SMS

Marketing:

- Coupons
- Referral System
- Loyalty Points
