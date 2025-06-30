
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { db, getCurrentUser } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { ManualRecordingTab } from '@/components/add-voucher/ManualRecordingTab';
import { ImageUploadTab } from '@/components/add-voucher/ImageUploadTab';
import { TextExtractionTab } from '@/components/add-voucher/TextExtractionTab';

export const AddVoucher = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'gift_card',
    balance: '',
    expiryDate: '',
    notes: '',
    eligibleBusinessesUrl: '',
    voucherUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const balance = parseFloat(formData.balance);
      
      if (isNaN(balance) || balance < 0) {
        toast({
          title: "Invalid Balance",
          description: "Please enter a valid balance amount.",
          variant: "destructive",
        });
        return;
      }

      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Invalid Expiry Date",
          description: "Expiry date must be in the future.",
          variant: "destructive",
        });
        return;
      }

      // Validate URLs if provided
      const validateUrl = (url: string) => {
        if (!url) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      if (!validateUrl(formData.eligibleBusinessesUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL for eligible businesses.",
          variant: "destructive",
        });
        return;
      }

      if (!validateUrl(formData.voucherUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid voucher URL.",
          variant: "destructive",
        });
        return;
      }

      // Create voucher
      const voucher = db.vouchers.create({
        userId: user.id,
        name: formData.name,
        code: formData.code,
        type: formData.type,
        balance: balance,
        originalBalance: balance,
        expiryDate: expiryDate,
        notes: formData.notes || undefined,
        eligibleBusinessesUrl: formData.eligibleBusinessesUrl || undefined,
        voucherUrl: formData.voucherUrl || undefined,
        isActive: true,
      });

      toast({
        title: "Voucher Added",
        description: `${voucher.name} has been added successfully.`,
      });

      navigate('/vouchers');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add voucher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Add New Voucher</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add a new voucher, gift card, or coupon to your collection
        </p>
      </div>

      {/* Main Card with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Voucher Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="w-full justify-center">
              <TabsTrigger value="manual">
                Manual Recording
              </TabsTrigger>
              <TabsTrigger value="image">
                Image Upload
              </TabsTrigger>
              <TabsTrigger value="text">
                Text Extraction
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-6">
              <ManualRecordingTab
                formData={formData}
                onInputChange={handleInputChange}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            </TabsContent>
            
            <TabsContent value="image" className="mt-6">
              <ImageUploadTab
                formData={formData}
                onInputChange={handleInputChange}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            </TabsContent>
            
            <TabsContent value="text" className="mt-6">
              <TextExtractionTab
                formData={formData}
                onInputChange={handleInputChange}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/vouchers')}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
