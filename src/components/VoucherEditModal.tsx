
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Voucher, Transaction } from '@/types';
import { db } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { useVoucherCategories } from '@/hooks/useVoucherCategories';
import { VoucherDeleteModal } from './VoucherDeleteModal';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';

interface VoucherEditModalProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher;
  onVoucherUpdated: (updatedVoucher: Voucher) => void;
}

interface EditingTransaction {
  id: string;
  description: string;
  amount: string;
  purchaseDate: string;
}

export const VoucherEditModal = ({ 
  open, 
  onClose, 
  voucher, 
  onVoucherUpdated 
}: VoucherEditModalProps) => {
  const [formData, setFormData] = useState({
    name: voucher.name,
    code: voucher.code,
    category: voucher.category,
    notes: voucher.notes || '',
    eligibleBusinessesUrl: voucher.eligibleBusinessesUrl || '',
    voucherUrl: voucher.voucherUrl || '',
    expiryDate: voucher.expiryDate.toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const { getAllCategories } = useVoucherCategories();
  const allCategories = getAllCategories();

  useEffect(() => {
    if (open) {
      const voucherTransactions = db.transactions.findByVoucherId(voucher.id);
      setTransactions(voucherTransactions);
    }
  }, [open, voucher.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateUrl(formData.eligibleBusinessesUrl) || !validateUrl(formData.voucherUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter valid URLs.",
          variant: "destructive"
        });
        return;
      }

      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Invalid Expiry Date",
          description: "Expiry date must be in the future.",
          variant: "destructive"
        });
        return;
      }

      const updatedVoucher = db.vouchers.update(voucher.id, {
        name: formData.name,
        code: formData.code,
        category: formData.category,
        notes: formData.notes || undefined,
        eligibleBusinessesUrl: formData.eligibleBusinessesUrl || undefined,
        voucherUrl: formData.voucherUrl || undefined,
        expiryDate: expiryDate
      });

      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
        toast({
          title: "Voucher Updated",
          description: `${updatedVoucher.name} has been updated successfully.`
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVoucher = () => {
    const success = db.vouchers.delete(voucher.id);
    if (success) {
      toast({
        title: "Voucher Deleted",
        description: `${voucher.name} has been permanently deleted.`
      });
      onClose();
      // Navigate back to vouchers page
      window.location.href = '/vouchers';
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the voucher. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateNewBalance = (transactions: Transaction[]) => {
    return transactions.reduce((balance, transaction) => {
      return transaction.newBalance;
    }, voucher.originalBalance);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      purchaseDate: transaction.purchaseDate?.toISOString().split('T')[0] || transaction.createdAt.toISOString().split('T')[0]
    });
  };

  const handleSaveTransaction = () => {
    if (!editingTransaction) return;

    const amount = parseFloat(editingTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    const transaction = transactions.find(t => t.id === editingTransaction.id);
    if (!transaction) return;

    const updatedTransaction = db.transactions.update(editingTransaction.id, {
      description: editingTransaction.description,
      amount: -amount, // Negative because it's a purchase
      purchaseDate: new Date(editingTransaction.purchaseDate)
    });

    if (updatedTransaction) {
      // Recalculate all balances after this transaction
      const sortedTransactions = db.transactions.findByVoucherId(voucher.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      let runningBalance = voucher.originalBalance;
      sortedTransactions.forEach(t => {
        const previousBalance = runningBalance;
        runningBalance += t.amount;
        db.transactions.update(t.id, {
          previousBalance,
          newBalance: runningBalance
        });
      });

      // Update voucher balance
      const newBalance = calculateNewBalance(sortedTransactions);
      const updatedVoucher = db.vouchers.update(voucher.id, { balance: newBalance });
      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
      }

      setTransactions(db.transactions.findByVoucherId(voucher.id));
      setEditingTransaction(null);
      toast({
        title: "Transaction Updated",
        description: "Transaction has been updated successfully."
      });
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const success = db.transactions.delete(transactionId);
    if (success) {
      // Recalculate balances
      const remainingTransactions = db.transactions.findByVoucherId(voucher.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      let runningBalance = voucher.originalBalance;
      remainingTransactions.forEach(t => {
        const previousBalance = runningBalance;
        runningBalance += t.amount;
        db.transactions.update(t.id, {
          previousBalance,
          newBalance: runningBalance
        });
      });

      // Update voucher balance
      const newBalance = calculateNewBalance(remainingTransactions);
      const updatedVoucher = db.vouchers.update(voucher.id, { balance: newBalance });
      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
      }

      setTransactions(remainingTransactions);
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been deleted successfully."
      });
    }
  };

  const handleAddTransaction = () => {
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    if (!newTransaction.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description for the transaction.",
        variant: "destructive"
      });
      return;
    }

    const previousBalance = voucher.balance;
    const newBalance = previousBalance - amount;

    if (newBalance < 0) {
      toast({
        title: "Insufficient Balance",
        description: "Transaction amount exceeds available balance.",
        variant: "destructive"
      });
      return;
    }

    const transaction = db.transactions.create({
      voucherId: voucher.id,
      amount: -amount, // Negative for purchase
      previousBalance,
      newBalance,
      description: newTransaction.description,
      purchaseDate: new Date(newTransaction.purchaseDate)
    });

    if (transaction) {
      const updatedVoucher = db.vouchers.update(voucher.id, { balance: newBalance });
      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
      }

      setTransactions(db.transactions.findByVoucherId(voucher.id));
      setNewTransaction({
        description: '',
        amount: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      setShowAddTransaction(false);
      toast({
        title: "Transaction Added",
        description: "Purchase has been recorded successfully."
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Voucher - {voucher.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Voucher Details</TabsTrigger>
              <TabsTrigger value="history">Purchase History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Voucher Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Voucher Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <span className="capitalize">{category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* URL Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="eligibleBusinessesUrl">Eligible Businesses URL</Label>
                <Input
                  id="eligibleBusinessesUrl"
                  type="url"
                  value={formData.eligibleBusinessesUrl}
                  onChange={(e) => handleInputChange('eligibleBusinessesUrl', e.target.value)}
                  placeholder="https://example.com/eligible-businesses"
                  className={!validateUrl(formData.eligibleBusinessesUrl) ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="voucherUrl">Voucher URL</Label>
                <Input
                  id="voucherUrl"
                  type="url"
                  value={formData.voucherUrl}
                  onChange={(e) => handleInputChange('voucherUrl', e.target.value)}
                  placeholder="https://example.com/voucher"
                  className={!validateUrl(formData.voucherUrl) ? 'border-red-500' : ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Updating...' : 'Update Voucher'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Purchase History</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTransaction(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button>
              </div>

              {showAddTransaction && (
                <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/30">
                  <h4 className="font-medium">Add New Purchase</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="new-description">Description</Label>
                      <Input
                        id="new-description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Purchase description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-amount">Amount</Label>
                      <Input
                        id="new-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-date">Purchase Date</Label>
                      <Input
                        id="new-date"
                        type="date"
                        value={newTransaction.purchaseDate}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddTransaction} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Transaction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddTransaction(false);
                        setNewTransaction({
                          description: '',
                          amount: '',
                          purchaseDate: new Date().toISOString().split('T')[0]
                        });
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No purchase history yet
                  </div>
                ) : (
                  transactions
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4 space-y-4">
                        {editingTransaction?.id === transaction.id ? (
                          // Edit mode - vertical layout
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`edit-date-${transaction.id}`}>Purchase Date</Label>
                                <Input
                                  id={`edit-date-${transaction.id}`}
                                  type="date"
                                  value={editingTransaction.purchaseDate}
                                  onChange={(e) => setEditingTransaction(prev => 
                                    prev ? { ...prev, purchaseDate: e.target.value } : null
                                  )}
                                  max={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`edit-amount-${transaction.id}`}>Amount</Label>
                                <Input
                                  id={`edit-amount-${transaction.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingTransaction.amount}
                                  onChange={(e) => setEditingTransaction(prev => 
                                    prev ? { ...prev, amount: e.target.value } : null
                                  )}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`edit-description-${transaction.id}`}>Description</Label>
                              <Input
                                id={`edit-description-${transaction.id}`}
                                value={editingTransaction.description}
                                onChange={(e) => setEditingTransaction(prev => 
                                  prev ? { ...prev, description: e.target.value } : null
                                )}
                                placeholder="Purchase description"
                              />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <div className="text-sm text-muted-foreground">
                                Balance After: <span className="font-medium">${transaction.newBalance.toFixed(2)}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSaveTransaction}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTransaction(null)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View mode - vertical layout
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Date</Label>
                                    <div className="text-sm font-medium">
                                      {(transaction.purchaseDate || transaction.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Amount</Label>
                                    <div className="text-sm font-medium text-red-600">
                                      -${Math.abs(transaction.amount).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Description</Label>
                                  <div className="text-sm">{transaction.description}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Balance After</Label>
                                  <div className="text-sm font-medium">${transaction.newBalance.toFixed(2)}</div>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this transaction? This action cannot be undone and will recalculate the voucher balance.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VoucherDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        voucherName={voucher.name}
        onConfirmDelete={handleDeleteVoucher}
      />
    </>
  );
};
