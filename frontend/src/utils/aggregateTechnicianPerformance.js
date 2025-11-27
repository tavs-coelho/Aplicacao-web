/**
 * Aggregates service order data to calculate technician performance.
 * Transforms raw service order data into aggregated format for charting.
 * 
 * @param {Array} serviceOrders - Array of service order objects with 'tecnico' field
 * @returns {Array} Aggregated data in format [{ nome: string, total_os: number }]
 */
export function aggregateTechnicianPerformance(serviceOrders) {
  if (!Array.isArray(serviceOrders)) {
    return [];
  }

  const technicianMap = new Map();

  for (const order of serviceOrders) {
    const technicianName = order.tecnico;
    if (!technicianName) {
      continue;
    }

    const currentCount = technicianMap.get(technicianName) || 0;
    technicianMap.set(technicianName, currentCount + 1);
  }

  const result = [];
  for (const [nome, total_os] of technicianMap) {
    result.push({ nome, total_os });
  }

  // Sort by total_os descending for better visualization
  result.sort((a, b) => b.total_os - a.total_os);

  return result;
}
