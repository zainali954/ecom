export const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "users",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "categories",
  },
  {
    label: "Attributes",
    href: "/admin/attributes",
    icon: "attributes",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "products",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: "inventory",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "orders",
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: "coupons",
  },
] as const;

export type AdminNavIcon = (typeof adminNavItems)[number]["icon"];
