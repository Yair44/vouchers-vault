
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { VoucherCard } from '@/components/VoucherCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Upload, User, Clock } from 'lucide-react';
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
  }, [user.id]);

  const recentVouchers = vouchers
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);

  const expiringVouchers = vouchers
    .filter(v => {
      const daysUntilExpiry = Math.ceil((v.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">
          You have {stats.activeCount} active vouchers worth ${stats.totalValue.toFixed(2)} in total.
        </p>
        <div className="mt-4">
          <Link to="/add">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Upload className="h-4 w-4 mr-2" />
              Add New Voucher
            </Button>
          </Link>
        </div>
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
        <StatsCard
          title="Active Cards"
          value={stats.activeCount}
          icon={Calendar}
          change={`${stats.totalVouchers - stats.activeCount} expired`}
          changeType="neutral"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/add">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Upload className="h-6 w-6" />
                <span>Add Voucher</span>
              </Button>
            </Link>
            <Link to="/vouchers">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span>View All</span>
              </Button>
            </Link>
            <Link to="/expiring">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Clock className="h-6 w-6" />
                <span>Expiring Soon</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Vouchers */}
      {recentVouchers.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Vouchers</CardTitle>
            <Link to="/vouchers">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentVouchers.map((voucher) => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher}
                  onClick={() => {
                    // TODO: Navigate to voucher detail
                    console.log('Navigate to voucher', voucher.id);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      {expiringVouchers.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expiringVouchers.map((voucher) => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher}
                  className="border-orange-200 dark:border-orange-800"
                  onClick={() => {
                    // TODO: Navigate to voucher detail
                    console.log('Navigate to voucher', voucher.id);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
