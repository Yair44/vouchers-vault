import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  Edit, 
  Save, 
  X,
  Crown
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export const Profile = () => {
  const { user, isLoading, isAdmin, isPreviewMode, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setNewDisplayName(data.full_name || '');
      } else {
        // Handle preview mode - create mock profile if no profile exists
        const mockProfile = {
          id: user.id,
          user_id: user.id,
          email: user.email || 'preview@example.com',
          full_name: user.user_metadata?.full_name || 'Preview User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(mockProfile);
        setNewDisplayName(mockProfile.full_name || '');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !profile) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newDisplayName.trim() || null })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: newDisplayName.trim() || null });
      setEditingName(false);
      
      toast({
        title: "Success",
        description: "Display name updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update display name",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out properly",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load profile information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          {isAdmin && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Admin
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.full_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {profile.full_name || 'Anonymous User'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Display Name
                </Label>
                {!editingName && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateName}
                    disabled={updating}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingName(false);
                      setNewDisplayName(profile.full_name || '');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile.full_name || 'No display name set'}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Account Role</span>
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Administrator" : "User"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profile.created_at)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Administrator Privileges
              </CardTitle>
              <CardDescription>
                You have administrator access to this VoucherVault instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>As an administrator, you can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access the admin panel</li>
                  <li>Manage feature flags</li>
                  <li>View audit logs</li>
                  <li>Manage user roles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};