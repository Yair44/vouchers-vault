
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useVoucherCategories } from '@/hooks/useVoucherCategories';
import { Trash2, Edit } from 'lucide-react';

interface VoucherCategoryManagerProps {
  open: boolean;
  onClose: () => void;
}

export const VoucherCategoryManager = ({ open, onClose }: VoucherCategoryManagerProps) => {
  const { customCategories, addCustomCategory, editCustomCategory, deleteCustomCategory } = useVoucherCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCustomCategory(newCategoryName);
      setNewCategoryName('');
    }
  };

  const handleEditCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      editCustomCategory(editingCategory.id, editingCategory.name);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
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
                          onClick={() => setEditingCategory({ id: category.id, name: category.name })}
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
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Voucher Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditCategory()}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEditCategory} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setEditingCategory(null)} className="flex-1">Cancel</Button>
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
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteCategory(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
