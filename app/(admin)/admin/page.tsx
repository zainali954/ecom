import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { Product } from "@/models/product";
import { User } from "@/models/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDashboardStats() {
  await connectDB();

  const [totalOrders, totalProducts, totalUsers, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: "customer", isActive: true }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  return { totalOrders, totalProducts, totalUsers, revenue };
}

export default async function AdminDashboardPage() {
  const { totalOrders, totalProducts, totalUsers, revenue } = await getDashboardStats();

  const stats = [
    { label: "Total Orders", value: totalOrders.toLocaleString() },
    { label: "Total Products", value: totalProducts.toLocaleString() },
    { label: "Total Users", value: totalUsers.toLocaleString() },
    { label: "Revenue", value: `Rs. ${revenue.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
