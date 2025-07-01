
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useVoucherCategories } from '@/hooks/useVoucherCategories';
import { Trash2, Edit } from 'lucide-react';

interface VoucherTypeManagerProps {
  open: boolean;
  onClose: () => void;
}

export const VoucherTypeManager = ({ open, onClose }: VoucherTypeManagerProps) => {
  const { customCategories, addCustomCategory, editCustomCategory, deleteCustomCategory } = useVoucherCategories();
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddType = () => {
    if (newTypeName.trim()) {
      addCustomCategory(newTypeName);
      setNewTypeName('');
    }
  };

  const handleEditType = () => {
    if (editingType && editingType.name.trim()) {
      editCustomCategory(editingType.id, editingType.name);
      setEditingType(null);
    }
  };

  const handleDeleteType = (id: string) => {
    deleteCustomCategory(id);
    setDeleteConfirm(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Voucher Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add new category */}
            <div className="space-y-2">
              <Label>Add New Category</Label>
              <div className="flex space-x-2">
                <Input
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Enter category name"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                />
                <Button onClick={handleAddType} disabled={!newTypeName.trim()}>
                  Add
                </Button>
              </div>
            </div>

            {/* Custom categories list */}
            {customCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Custom Categories</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="capitalize">{category.name}</span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingType({ id: category.id, name: category.name })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit category dialog */}
      <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Voucher Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={editingType?.name || ''}
                onChange={(e) => setEditingType(prev => prev ? { ...prev, name: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditType()}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEditType} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setEditingType(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this voucher category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteType(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
