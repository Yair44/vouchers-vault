
import * as XLSX from 'xlsx';
import { Voucher } from '@/types';

export const exportVouchersToExcel = (vouchers: Voucher[], filename?: string) => {
  // Prepare data for Excel
  const excelData = vouchers.map(voucher => ({
    'Name': voucher.name,
    'Code': voucher.code,
    'Category': voucher.category || 'Unspecified',
    'Current Balance': voucher.balance,
    'Original Balance': voucher.originalBalance,
    'Expiry Date': voucher.expiryDate.toLocaleDateString(),
    'Status': getVoucherStatus(voucher),
    'Notes': voucher.notes || '',
    'Eligible Businesses URL': voucher.eligibleBusinessesUrl || '',
    'Voucher URL': voucher.voucherUrl || '',
    'Offered for Sale': voucher.offerForSale ? 'Yes' : 'No',
    'Sale Price': voucher.salePrice || '',
    'Contact Info': voucher.contactInfo || '',
    'Created Date': voucher.createdAt.toLocaleDateString(),
    'Updated Date': voucher.updatedAt.toLocaleDateString()
  }));

  // Create summary data
  const totalValue = vouchers.reduce((sum, v) => sum + v.balance, 0);
  const activeCount = vouchers.filter(v => v.isActive && v.expiryDate > new Date()).length;
  const expiredCount = vouchers.filter(v => !v.isActive || v.expiryDate <= new Date()).length;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const expiringCount = vouchers.filter(v => 
    v.isActive && v.expiryDate <= thirtyDaysFromNow && v.expiryDate > new Date()
  ).length;

  const summaryData = [
    ['Export Summary', ''],
    ['Export Date', new Date().toLocaleDateString()],
    ['Total Vouchers', vouchers.length],
    ['Total Value', `$${totalValue.toFixed(2)}`],
    ['Active Vouchers', activeCount],
    ['Expired Vouchers', expiredCount],
    ['Expiring Soon', expiringCount],
    ['Offered for Sale', vouchers.filter(v => v.offerForSale).length]
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Add vouchers data sheet
  const dataWs = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, dataWs, 'Vouchers');

  // Generate filename
  const defaultFilename = `My_Vouchers_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;

  // Save file
  XLSX.writeFile(wb, finalFilename);
};

const getVoucherStatus = (voucher: Voucher): string => {
  if (!voucher.isActive || voucher.expiryDate <= new Date()) {
    return 'Expired';
  }
  
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (voucher.expiryDate <= thirtyDaysFromNow) {
    return 'Expiring Soon';
  }
  
  return 'Active';
};
