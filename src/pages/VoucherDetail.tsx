import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Calendar, Clock, ExternalLink, Upload, Edit } from 'lucide-react';
import { db } from '@/lib/db';
import { Voucher, Transaction, getVoucherStatus } from '@/types';
import { VoucherProgress } from '@/components/VoucherProgress';
import { VoucherEditModal } from '@/components/VoucherEditModal';
import { VoucherCodeSection } from '@/components/VoucherCodeSection';
import { VoucherStatusBadge } from '@/components/VoucherStatusBadge';
import { VoucherImagePreview } from '@/components/VoucherImagePreview';
import { PurchaseRecordModal } from '@/components/PurchaseRecordModal';
import { OfferForSaleModal } from '@/components/OfferForSaleModal';
import { toast } from '@/hooks/use-toast';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { ImageStorage } from '@/lib/imageStorage';
export const VoucherDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
  const handleImageUpload = async (files: FileList) => {
    if (!voucher || !files) return;
    const imageIds = voucher.imageUrls || [];
    if (imageIds.length >= 2) return;
    setIsUploadingImage(true);
    try {
      const validFiles = Array.from(files).filter(validateImageFile);
      for (const file of validFiles.slice(0, 2 - imageIds.length)) {
        const compressedImage = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeKB: 500
        });
        const imageId = await ImageStorage.uploadImage(compressedImage, voucher.id);
        const updatedVoucher = db.vouchers.update(voucher.id, {
          imageUrls: [...imageIds, imageId]
        });
        if (updatedVoucher) {
          setVoucher(updatedVoucher);
        }
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };
  const handleImageRemove = async (index: number) => {
    if (!voucher) return;
    const imageIds = voucher.imageUrls || [];
    const imageId = imageIds[index];
    try {
      await ImageStorage.deleteImage(imageId);
      const updatedVoucher = db.vouchers.update(voucher.id, {
        imageUrls: imageIds.filter((_, i) => i !== index)
      });
      if (updatedVoucher) {
        setVoucher(updatedVoucher);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };
  if (loading || !voucher) {
    return <div className="flex items-center justify-center min-h-64">
        <div className="text-center">Loading...</div>
      </div>;
  }
  const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  const imageIds = voucher.imageUrls || (voucher.imageUrl ? [voucher.imageUrl] : []);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'retail':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'restaurants':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'travel':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'services':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  return <div className="space-y-6">
      {/* Header with Edit Details button moved here */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/vouchers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vouchers
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
          
          {voucher.balance > 0 && !isExpired && !voucher.offerForSale && <Button onClick={() => setShowSaleModal(true)} className="bg-green-600 hover:bg-green-700 text-white flex items-center shadow-md">
              <DollarSign className="h-4 w-4 mr-2" />
              Offer for Sale
            </Button>}
        </div>
      </div>

      {/* Voucher Name - Centered and Styled */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
          {voucher.name}
        </h1>
      </div>

      {/* Voucher Code and Images with Status Badge */}
      <VoucherCodeSection 
        code={voucher.code} 
        imageIds={imageIds} 
        voucherName={voucher.name} 
        voucher={voucher}
        transactions={transactions}
        onImagePreview={imageIds.length > 0 ? () => setShowImagePreview(true) : undefined} 
        onImageUpload={handleImageUpload} 
        onImageRemove={handleImageRemove} 
        isUploadingImage={isUploadingImage} 
      />

      {/* Voucher Details */}
      <Card className="shadow-md">
        <CardContent className="space-y-6 p-6">
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
              {voucher.category && <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1">
                    <Badge className={getCategoryColor(voucher.category)}>
                      {voucher.category.charAt(0).toUpperCase() + voucher.category.slice(1)}
                    </Badge>
                  </div>
                </div>}
              
              {voucher.eligibleBusinessesUrl && <div>
                  <label className="text-sm font-medium text-gray-500">Eligible Businesses</label>
                  <a href={voucher.eligibleBusinessesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 mt-1">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View eligible businesses
                  </a>
                </div>}
              
              {voucher.voucherUrl && <div>
                  <label className="text-sm font-medium text-gray-500">Voucher URL</label>
                  <a href={voucher.voucherUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 mt-1">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View voucher online
                  </a>
                </div>}
            </div>
          </div>

          <VoucherProgress current={voucher.balance} original={voucher.originalBalance} className="mt-6" />

          {voucher.notes && <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{voucher.notes}</p>
            </div>}
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase History</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowPurchaseModal(true)} disabled={voucher.balance <= 0 || isExpired}>
            <Upload className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? <div className="space-y-3">
              {transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                </div>)}
            </div> : <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No purchase history yet
            </p>}
        </CardContent>
      </Card>

      {/* Modals */}
      <VoucherEditModal open={showEditModal} onClose={() => setShowEditModal(false)} voucher={voucher} onVoucherUpdated={handleVoucherUpdate} />

      {imageIds.length > 0 && <VoucherImagePreview open={showImagePreview} onClose={() => setShowImagePreview(false)} imageIds={imageIds} voucherName={voucher.name} />}

      <PurchaseRecordModal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} voucher={voucher} onPurchaseRecorded={handleVoucherUpdate} />

      <OfferForSaleModal open={showSaleModal} onClose={() => setShowSaleModal(false)} voucher={voucher} onVoucherUpdated={handleVoucherUpdate} />
    </div>;
};
