
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VoucherCard } from '@/components/VoucherCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Upload, Calendar, Download } from 'lucide-react';
import { db, getCurrentUser } from '@/lib/db';
import { Voucher } from '@/types';
import { Link } from 'react-router-dom';
import { exportVouchersToExcel } from '@/lib/excelExport';
import { toast } from '@/hooks/use-toast';

export const Vouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [isExporting, setIsExporting] = useState(false);
  const [searchParams] = useSearchParams();

  const user = getCurrentUser();

  const handleVoucherUpdate = (updatedVoucher: Voucher) => {
    setVouchers(prev => 
      prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v)
    );
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      exportVouchersToExcel(filteredVouchers);
      toast({
        title: "Export Successful",
        description: `Exported ${filteredVouchers.length} vouchers to Excel.`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vouchers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const userVouchers = db.vouchers.findByUserId(user.id);
    setVouchers(userVouchers);
    setFilteredVouchers(userVouchers);
  }, [user.id]);

  // Handle URL search parameter on component mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = vouchers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(voucher =>
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'active') {
        filtered = filtered.filter(v => v.isActive && v.expiryDate > new Date());
      } else if (filterType === 'expired') {
        filtered = filtered.filter(v => !v.isActive || v.expiryDate <= new Date());
      } else if (filterType === 'expiring') {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(v => v.isActive && v.expiryDate <= thirtyDaysFromNow && v.expiryDate > new Date());
      } else {
        filtered = filtered.filter(voucher => voucher.type === filterType);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return b.balance - a.balance;
        case 'expiry':
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default: // updated
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    setFilteredVouchers(filtered);
  }, [vouchers, searchTerm, filterType, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">My Vouchers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your {vouchers.length} vouchers
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting || filteredVouchers.length === 0}
            variant="outline"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          <Link to="/add">
            <Button className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Add Voucher
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vouchers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="gift_card">Gift Cards</SelectItem>
                <SelectItem value="coupon">Coupons</SelectItem>
                <SelectItem value="loyalty_card">Loyalty Cards</SelectItem>
                <SelectItem value="discount">Discounts</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="created">Recently Added</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="balance">Highest Balance</SelectItem>
                <SelectItem value="expiry">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Grid */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVouchers.map((voucher) => (
            <VoucherCard 
              key={voucher.id} 
              voucher={voucher}
              onVoucherUpdated={handleVoucherUpdate}
              onClick={() => {
                // TODO: Navigate to voucher detail
                console.log('Navigate to voucher', voucher.id);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vouchers found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterType !== 'all' 
                ? "Try adjusting your search or filters." 
                : "Start by adding your first voucher."
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Link to="/add">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Your First Voucher
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
