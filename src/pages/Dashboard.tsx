
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Plus, Calendar, User, Clock } from 'lucide-react';
import { db, getCurrentUser } from '@/lib/db';
import { Voucher, VoucherStats } from '@/types';

export const Dashboard = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({
    totalVouchers: 0,
    totalValue: 0,
    expiringCount: 0,
    activeCount: 0
  });
  const [voucherAnalytics, setVoucherAnalytics] = useState<Array<{name: string, value: number}>>([]);

  const user = getCurrentUser();

  useEffect(() => {
    // Load user's vouchers
    const userVouchers = db.vouchers.findByUserId(user.id);
    setVouchers(userVouchers);

    // Calculate stats
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const activeVouchers = userVouchers.filter(v => v.isActive && v.expiryDate > now);
    const expiringVouchers = activeVouchers.filter(v => v.expiryDate <= thirtyDaysFromNow);
    const totalValue = activeVouchers.reduce((sum, v) => sum + v.balance, 0);

    setStats({
      totalVouchers: userVouchers.length,
      totalValue,
      expiringCount: expiringVouchers.length,
      activeCount: activeVouchers.length
    });

    // Calculate analytics - sum of values by voucher name
    const vouchersByName = activeVouchers.reduce((acc, voucher) => {
      if (acc[voucher.name]) {
        acc[voucher.name] += voucher.balance;
      } else {
        acc[voucher.name] = voucher.balance;
      }
      return acc;
    }, {} as Record<string, number>);

    const analyticsData = Object.entries(vouchersByName)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setVoucherAnalytics(analyticsData);
  }, [user.id]);

  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">
      {/* New Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-purple-600">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage your digital voucher portfolio
        </p>
        <Link to="/add">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Voucher</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Vouchers"
          value={stats.totalVouchers}
          icon={Calendar}
          change={`${stats.activeCount} active`}
          changeType="positive"
        />
        <StatsCard
          title="Total Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={User}
          change="Available balance"
          changeType="positive"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringCount}
          icon={Clock}
          change="Next 30 days"
          changeType={stats.expiringCount > 0 ? "negative" : "neutral"}
        />
      </div>

      {/* Analytics Chart */}
      {voucherAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Voucher Value Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={voucherAnalytics}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`$${value}`, "Value"]}
                  />} 
                />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
