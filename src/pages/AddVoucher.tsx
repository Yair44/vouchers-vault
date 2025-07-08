
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { voucherService } from '@/services/supabase';
import { ManualRecordingTab } from '@/components/add-voucher/ManualRecordingTab';
import { ImageUploadTab } from '@/components/add-voucher/ImageUploadTab';
import { TextExtractionTab } from '@/components/add-voucher/TextExtractionTab';

export const AddVoucher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    balance: '',
    expiryDate: '',
    notes: '',
    eligibleBusinessesUrl: '',
    voucherUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent, imageIds?: string[]) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add vouchers.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const balance = parseFloat(formData.balance);
      if (isNaN(balance) || balance < 0) {
        toast({
          title: "Invalid Balance",
          description: "Please enter a valid balance amount.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Invalid Expiry Date",
          description: "Expiry date must be in the future.",
          variant: "destructive"
        });
        setIsLoading(false);
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
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      if (!validateUrl(formData.voucherUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid voucher URL.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create voucher with Supabase
      const voucher = await voucherService.createVoucher(user.id, {
        name: formData.name,
        code: formData.code,
        category: formData.category || undefined,
        balance: balance,
        originalBalance: balance,
        expiryDate: expiryDate,
        notes: formData.notes || undefined,
        eligibleBusinessesUrl: formData.eligibleBusinessesUrl || undefined,
        voucherUrl: formData.voucherUrl || undefined,
        imageUrls: imageIds && imageIds.length > 0 ? imageIds : undefined,
        isActive: true
      });

      if (voucher) {
        toast({
          title: "Voucher Added",
          description: `${voucher.name} has been added successfully.`
        });
        navigate('/vouchers');
      } else {
        throw new Error('Failed to create voucher');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to add voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Add New Voucher</h1>
        <p className="text-gray-600 dark:text-gray-400">Manual Type, paste the entire text 
or just upload a screenshot</p>
      </div>

      {/* Main Card with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            <Calendar className="h-5 w-5 mr-2" />
            Voucher Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="mb-6 grid grid-cols-3 w-full">
              <TabsTrigger 
                value="manual" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-400 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Manual Recording</span>
                <span className="sm:hidden">Manual</span>
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-400 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Image Upload</span>
                <span className="sm:hidden">Image</span>
              </TabsTrigger>
              <TabsTrigger 
                value="text" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-400 data-[state=active]:text-white whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Text Extraction</span>
                <span className="sm:hidden">Text</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <ManualRecordingTab formData={formData} onInputChange={handleInputChange} isLoading={isLoading} onSubmit={handleSubmit} />
            </TabsContent>
            
            <TabsContent value="image">
              <ImageUploadTab formData={formData} onInputChange={handleInputChange} isLoading={isLoading} onSubmit={handleSubmit} />
            </TabsContent>
            
            <TabsContent value="text">
              <TextExtractionTab formData={formData} onInputChange={handleInputChange} isLoading={isLoading} onSubmit={handleSubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <div className="text-center">
        <Button variant="outline" onClick={() => navigate('/vouchers')}>
          Cancel
        </Button>
      </div>
    </div>;
};
