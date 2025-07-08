import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Ticket, DollarSign, Clock, X } from 'lucide-react';
import { Voucher, VoucherStats } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { voucherService } from '@/services/supabase';
import { useIsMobile } from '@/hooks/use-mobile';

export const Dashboard = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({
    totalVouchers: 0,
    totalValue: 0,
    expiringCount: 0,
    activeCount: 0
  });
  const [voucherAnalytics, setVoucherAnalytics] = useState<Array<{name: string, value: number}>>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showDataPopup, setShowDataPopup] = useState(false);
  const [popupData, setPopupData] = useState<{name: string, value: number} | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation control state
  const hasAnimatedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Reset animation state when component mounts (page visit/refresh)
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      setShouldAnimate(true);
      // Set animation as completed after initial animation duration
      const animationTimeout = setTimeout(() => {
        hasAnimatedRef.current = true;
        setShouldAnimate(false);
      }, 1000); // Adjust timing based on your chart animation duration

      return () => clearTimeout(animationTimeout);
    } else {
      // If already animated, don't animate again
      setShouldAnimate(false);
    }
  }, []);

  // Scroll detection for mobile (only for click prevention)
  const handleScroll = useCallback(() => {
    if (!isMobile) return;
    
    setIsScrolling(true);
    
    // Clear existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    
    // Set new timeout to detect when scrolling stops
    const timeout = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    setClickTimeout(timeout);
  }, [isMobile, clickTimeout]);

  useEffect(() => {
    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
      };
    }
  }, [isMobile, handleScroll, clickTimeout]);

  // Reset click state after timeout
  useEffect(() => {
    if (selectedColumn && showDataPopup) {
      const resetTimeout = setTimeout(() => {
        resetClickState();
      }, 3000);
      
      return () => clearTimeout(resetTimeout);
    }
  }, [selectedColumn, showDataPopup]);

  const resetClickState = () => {
    setSelectedColumn(null);
    setShowDataPopup(false);
    setPopupData(null);
  };

  // Enhanced bar click handler
  const handleBarInteraction = (data: any) => {
    if (!data || !data.name) return;
    
    // If scrolling on mobile, ignore clicks
    if (isMobile && isScrolling) return;
    
    // Desktop behavior - direct navigation
    if (!isMobile) {
      navigate(`/vouchers?search=${encodeURIComponent(data.name)}`);
      return;
    }
    
    // Mobile behavior - two-step interaction
    if (selectedColumn === data.name && showDataPopup) {
      // Second click - navigate
      navigate(`/vouchers?search=${encodeURIComponent(data.name)}`);
      resetClickState();
    } else {
      // First click - show popup
      setSelectedColumn(data.name);
      setPopupData(data);
      setShowDataPopup(true);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Load user's vouchers
        const userVouchers = await voucherService.getVouchersByUserId(user.id);
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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const chartConfig = {
    value: {
      label: "Value",
      color: "url(#gradient-purple-pink)",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-lg">Please sign in to view your dashboard.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage your digital voucher portfolio
        </p>
        <Link to="/add">
          <Button className="px-6 py-3 rounded-lg flex items-center space-x-2">
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
          icon={Ticket}
          change={`${stats.activeCount} active`}
          changeType="positive"
        />
        <StatsCard
          title="Total Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={DollarSign}
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

      {/* Analytics Chart - Full Width with minimal margins */}
      {voucherAnalytics.length > 0 && (
        <div className="relative">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Voucher Value Analytics
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isMobile ? "Tap once to see details, tap again to filter vouchers" : "Click on any column to filter vouchers"}
              </p>
            </CardHeader>
            <CardContent className="px-2">
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <BarChart data={voucherAnalytics} margin={{ top: 20, right: 5, left: 5, bottom: 80 }}>
                  <defs>
                    <linearGradient id="gradient-purple-pink" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="gradient-purple-pink-selected" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#fb7cc0" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  {!isMobile && (
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [`$${value}`, "Value"]}
                      />} 
                    />
                  )}
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    onClick={handleBarInteraction}
                    style={{ cursor: 'pointer' }}
                    className="hover:opacity-80 transition-opacity"
                    isAnimationActive={shouldAnimate}
                  >
                    {voucherAnalytics.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedColumn === entry.name ? "url(#gradient-purple-pink-selected)" : "url(#gradient-purple-pink)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Data Popup for Mobile */}
          {showDataPopup && popupData && isMobile && (
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 z-10 min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">Voucher Details</h3>
                <button 
                  onClick={resetClickState}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{popupData.name}</p>
                <p className="text-lg font-bold text-green-600">${popupData.value.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Tap column again to view vouchers</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
