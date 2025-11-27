/**
 * Exports service orders to CSV format and triggers browser download.
 * @param {Array} orders - Array of service order objects
 * @param {string} filename - Name of the CSV file (default: 'ordens-servico.csv')
 */
export function exportOrdersToCSV(orders, filename = 'ordens-servico.csv') {
  if (!orders || orders.length === 0) {
    console.warn('No orders to export');
    return;
  }

  // CSV headers
  const headers = ['ID', 'Cliente', 'Técnico', 'Status', 'Data'];
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'Concluído';
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Escape CSV field (handle commas, quotes, and newlines)
  const escapeCSVField = (field) => {
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = orders.map((order) => [
    escapeCSVField(order.id ?? ''),
    escapeCSVField(order.cliente ?? ''),
    escapeCSVField(order.tecnico ?? ''),
    escapeCSVField(formatStatus(order.status)),
    escapeCSVField(formatDate(order.data)),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link and trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
