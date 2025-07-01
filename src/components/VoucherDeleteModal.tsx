
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface VoucherDeleteModalProps {
  open: boolean;
  onClose: () => void;
  voucherName: string;
  onConfirmDelete: () => void;
}

export const VoucherDeleteModal = ({ 
  open, 
  onClose, 
  voucherName, 
  onConfirmDelete 
}: VoucherDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete voucher:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Delete Voucher</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You are about to permanently delete the voucher <strong>"{voucherName}"</strong>.
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone. All transaction history will also be deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
