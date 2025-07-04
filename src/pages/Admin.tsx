import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from '@/hooks/use-toast';

export const Admin = () => {
  const navigate = useNavigate();
  const { flags, updateFlag } = useFeatureFlags();

  const handleToggle = (key: keyof typeof flags, value: boolean) => {
    updateFlag(key, value);
    toast({
      title: "Feature Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/vouchers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vouchers
        </Button>
        
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
      </div>

      {/* Feature Flags Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Control application features and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* List for Sale Feature */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">List for Sale</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow users to offer their vouchers for sale to other users
              </p>
              <p className="text-xs text-gray-500">
                Status: <span className={flags.listForSaleEnabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {flags.listForSaleEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
            </div>
            <Switch
              checked={flags.listForSaleEnabled}
              onCheckedChange={(checked) => handleToggle('listForSaleEnabled', checked)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-md border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Changes take effect immediately across the application</p>
            <p>• Feature flags are stored in browser localStorage</p>
            <p>• Access this admin panel at: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/admin</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};