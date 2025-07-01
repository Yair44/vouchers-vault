
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, Clock, CheckCircle, XCircle, ExternalLink, Download, Upload, Eye } from 'lucide-react';
import { db } from '@/lib/db';
import { Voucher, Transaction } from '@/types';
import { VoucherProgress } from '@/components/VoucherProgress';
import { VoucherEditModal } from '@/components/VoucherEditModal';
import { VoucherDeleteModal } from '@/components/VoucherDeleteModal';
import { VoucherImagePreview } from '@/components/VoucherImagePreview';
import { PurchaseRecordModal } from '@/components/PurchaseRecordModal';
import { OfferForSaleModal } from '@/components/OfferForSaleModal';
import { toast } from '@/hooks/use-toast';

export const VoucherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/vouchers');
      return;
    }

    const voucherData = db.vouchers.findById(id);
    if (!voucherData) {
      navigate('/vouchers');
      return;
    }

    const voucherTransactions = db.transactions.findByVoucherId(id);
    setVoucher(voucherData);
    setTransactions(voucherTransactions);
    setLoading(false);
  }, [id, navigate]);

  const handleVoucherUpdate = (updatedVoucher: Voucher) => {
    setVoucher(updatedVoucher);
  };

  const handleDeleteVoucher = () => {
    if (!voucher) return;
    
    const success = db.vouchers.delete(voucher.id);
    if (success) {
      toast({
        title: "Voucher Deleted",
        description: `${voucher.name} has been permanently deleted.`
      });
      navigate('/vouchers');
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the voucher. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading || !voucher) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  
  const imageIds = voucher.imageUrls || (voucher.imageUrl ? [voucher.imageUrl] : []);
  const hasImages = imageIds.length > 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gift_card': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'coupon': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'loyalty_card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'discount': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
        </div>
        
        {voucher.balance > 0 && !isExpired && !voucher.offerForSale && (
          <Button 
            onClick={() => setShowSaleModal(true)}
            className="flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Offer for Sale
          </Button>
        )}
      </div>

      {/* Voucher Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{voucher.name}</CardTitle>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-mono">
                {voucher.code}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                  {isExpired ? 'Expired' : isExpiringSoon ? `${daysUntilExpiry} days left` : `${daysUntilExpiry} days`}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {voucher.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voucher Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voucher Information</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Original Value</label>
                <p className="text-xl font-semibold">${voucher.originalBalance.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Value</label>
                <p className="text-xl font-semibold text-green-600">${voucher.balance.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                <p className="text-lg">{voucher.expiryDate.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {voucher.type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1">
                    <Badge className={getTypeColor(voucher.type)}>
                      {voucher.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )}
              
              {voucher.eligibleBusinessesUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Eligible Businesses</label>
                  <a
                    href={voucher.eligibleBusinessesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View eligible businesses
                  </a>
                </div>
              )}
              
              {voucher.voucherUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Voucher URL</label>
                  <a
                    href={voucher.voucherUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View voucher online
                  </a>
                </div>
              )}
            </div>
          </div>

          <VoucherProgress 
            current={voucher.balance} 
            original={voucher.originalBalance}
            className="mt-6"
          />

          {voucher.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{voucher.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      {hasImages && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Images</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowImagePreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                View Images
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {imageIds.length} image{imageIds.length > 1 ? 's' : ''} attached
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purchase History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase History</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPurchaseModal(true)}
            disabled={voucher.balance <= 0 || isExpired}
          >
            <Upload className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Balance: ${transaction.newBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No purchase history yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <VoucherEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        voucher={voucher}
        onVoucherUpdated={handleVoucherUpdate}
      />

      <VoucherDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        voucherName={voucher.name}
        onConfirmDelete={handleDeleteVoucher}
      />

      {hasImages && (
        <VoucherImagePreview
          open={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          imageIds={imageIds}
          voucherName={voucher.name}
        />
      )}

      <PurchaseRecordModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        voucher={voucher}
        onPurchaseRecorded={handleVoucherUpdate}
      />

      <OfferForSaleModal
        open={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        voucher={voucher}
        onVoucherUpdated={handleVoucherUpdate}
      />
    </div>
  );
};
