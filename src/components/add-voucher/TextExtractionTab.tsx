import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Loader2 } from 'lucide-react';

interface TextExtractionTabProps {
  formData: {
    name: string;
    code: string;
    balance: string;
    expiryDate: string;
    notes: string;
    eligibleBusinessesUrl: string;
    voucherUrl: string;
  };
  onInputChange: (field: string, value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const TextExtractionTab = ({ formData, onInputChange, isLoading, onSubmit }: TextExtractionTabProps) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const extractVoucherInfo = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Extract URLs from text
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const urls = text.match(urlRegex) || [];
      
      // Process any detected URLs
      if (urls.length > 0) {
        console.log('Detected URLs:', urls);
      }

      // Basic text extraction patterns
      const extracted = {
        name: extractName(text),
        balance: extractBalance(text),
        code: extractCode(text),
        expiryDate: extractDate(text),
        urls: urls,
      };

      setExtractedData(extracted);
      
      // Auto-fill form with extracted data
      if (extracted.name) onInputChange('name', extracted.name);
      if (extracted.balance) onInputChange('balance', extracted.balance);
      if (extracted.code) onInputChange('code', extracted.code);
      if (extracted.expiryDate) onInputChange('expiryDate', extracted.expiryDate);
      if (extracted.urls[0]) onInputChange('voucherUrl', extracted.urls[0]);
      
      // Automatically open the form after extraction
      setIsFormOpen(true);
      
    } catch (error) {
      console.error('Text extraction failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractName = (text: string): string => {
    const patterns = [
      /([A-Za-z\s]+(?:gift card|voucher|coupon))/gi,
      /(amazon|walmart|target|starbucks|apple|google)[^.!?]*(?:gift card|voucher|card)/gi,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }
    
    return '';
  };

  const extractBalance = (text: string): string => {
    const patterns = [
      /\$(\d+(?:\.\d{2})?)/g,
      /(\d+(?:\.\d{2})?) ?(?:USD|dollars?)/gi,
      /(?:balance|amount|value):\s*\$?(\d+(?:\.\d{2})?)/gi,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = match[0].replace(/[^\d.]/g, '');
        return amount;
      }
    }
    
    return '';
  };

  const extractCode = (text: string): string => {
    const patterns = [
      /(?:code|voucher code|gift card code):\s*([A-Z0-9-]{4,})/gi,
      /([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})/g,
      /([A-Z0-9]{8,})/g,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0].replace(/.*:\s*/, '');
    }
    
    return '';
  };

  const extractDate = (text: string): string => {
    const patterns = [
      /(?:expires?|expiry|valid until):\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(\d{4}-\d{2}-\d{2})/g,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[0].replace(/.*:\s*/, '');
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return '';
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Text Input Area */}
      <div>
        <Label htmlFor="rawText">Paste Voucher Information</Label>
        <Textarea
          id="rawText"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste your voucher details here... Include links, codes, amounts, expiry dates, etc."
          rows={6}
          className="mt-2"
        />
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={() => extractVoucherInfo(rawText)}
            disabled={!rawText.trim() || isProcessing}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Extract Information'
            )}
          </Button>
        </div>
      </div>

      {/* Extracted Information Preview */}
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Extracted Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {extractedData.name && <p><strong>Name:</strong> {extractedData.name}</p>}
            {extractedData.balance && <p><strong>Balance:</strong> ${extractedData.balance}</p>}
            {extractedData.code && <p><strong>Code:</strong> {extractedData.code}</p>}
            {extractedData.expiryDate && <p><strong>Expiry:</strong> {extractedData.expiryDate}</p>}
            {extractedData.urls.length > 0 && (
              <p><strong>URLs found:</strong> {extractedData.urls.length}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Collapsible Form Fields */}
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <CollapsibleContent className="space-y-4 mt-4">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Mandatory Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Voucher Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  placeholder="e.g., Amazon Gift Card"
                  required
                />
              </div>
              <div>
                <Label htmlFor="balance">Balance/Value *</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={(e) => onInputChange('balance', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => onInputChange('expiryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* URL Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="eligibleBusinessesUrl">Eligible Businesses for Usage</Label>
                <Input
                  id="eligibleBusinessesUrl"
                  type="url"
                  value={formData.eligibleBusinessesUrl}
                  onChange={(e) => onInputChange('eligibleBusinessesUrl', e.target.value)}
                  placeholder="https://example.com/eligible-businesses"
                  className={!validateUrl(formData.eligibleBusinessesUrl) ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="voucherUrl">Voucher Link</Label>
                <Input
                  id="voucherUrl"
                  type="url"
                  value={formData.voucherUrl}
                  onChange={(e) => onInputChange('voucherUrl', e.target.value)}
                  placeholder="https://example.com/voucher"
                  className={!validateUrl(formData.voucherUrl) ? 'border-red-500' : ''}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <Label htmlFor="code">Voucher Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => onInputChange('code', e.target.value)}
                placeholder="e.g., ABCD-1234-EFGH"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => onInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or details about this voucher..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Adding...' : 'Add Voucher'}
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
