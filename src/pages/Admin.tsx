import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Shield, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecureFeatureFlags } from '@/hooks/useSecureFeatureFlags';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const AdminContent = () => {
  const navigate = useNavigate();
  const { flags, updateFlag, isLoading } = useSecureFeatureFlags();
  const { user, signOut } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select(`
          id,
          action,
          details,
          created_at,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleToggle = async (key: keyof typeof flags, value: boolean) => {
    try {
      await updateFlag(key, value);
      toast({
        title: "Feature Updated",
        description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
      });
      fetchAuditLogs(); // Refresh audit logs
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update feature flag",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/vouchers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vouchers
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
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
          {isLoading ? (
            <div className="text-center py-4">Loading feature flags...</div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h3 className="font-medium">List for Sale</h3>
                <p className="text-sm text-muted-foreground">
                  Allow users to offer their vouchers for sale to other users
                </p>
                <p className="text-xs text-muted-foreground">
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
          )}
        </CardContent>
      </Card>

      {/* Audit Log Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Admin Actions
          </CardTitle>
          <CardDescription>
            Track of all administrative actions performed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-4">Loading audit logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No admin actions recorded yet</div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{log.action.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">
                        by {log.profiles?.full_name || log.profiles?.email}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info Card */}
      <Card className="shadow-md border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Changes are stored securely in the database with full audit trail</p>
            <p>• Only authenticated admin users can access this panel</p>
            <p>• All admin actions are logged and tracked</p>
            <p>• Feature flags sync in real-time across all users</p>
            <p>• Access this admin panel at: <code className="bg-muted px-1 rounded">/admin</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Admin = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
};