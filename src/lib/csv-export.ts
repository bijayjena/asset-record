import { Gadget, getCategoryLabel, getConditionLabel } from '@/types/gadget';
import { formatPrice, Currency } from '@/lib/currency';

export const exportGadgetsToCSV = (gadgets: Gadget[], currency: Currency = 'USD') => {
  const headers = [
    'Name',
    'Brand',
    'Model',
    'Category',
    'Condition',
    'Purchase Date',
    'Price Paid',
    'Warranty Expiry',
    'Vendor',
    'Order ID',
    'Serial Number',
    'Notes',
  ];

  const rows = gadgets.map((gadget) => [
    escapeCSV(gadget.name),
    escapeCSV(gadget.brand),
    escapeCSV(gadget.model || ''),
    getCategoryLabel(gadget.category),
    getConditionLabel(gadget.condition),
    gadget.purchase_date,
    gadget.price_paid ? formatPrice(gadget.price_paid, currency) : '',
    gadget.warranty_expiry || '',
    escapeCSV(gadget.vendor_name || ''),
    escapeCSV(gadget.order_id || ''),
    escapeCSV(gadget.serial_number || ''),
    escapeCSV(gadget.notes || ''),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
};

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
