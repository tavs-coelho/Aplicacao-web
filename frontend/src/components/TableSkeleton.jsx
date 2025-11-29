// TableSkeleton component - displays loading skeleton with pulse animation

// Predefined widths for skeleton cells to avoid flickering on re-render
const SKELETON_WIDTHS = ['75%', '60%', '80%', '65%', '70%'];

function TableSkeleton({ rows = 5, columns = 5 }) {
  // Get deterministic width based on row and column index
  const getWidth = (rowIndex, colIndex) => {
    const index = (rowIndex + colIndex) % SKELETON_WIDTHS.length;
    return SKELETON_WIDTHS[index];
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left"
                >
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="h-4 bg-gray-200 rounded animate-pulse"
                      style={{ 
                        width: getWidth(rowIndex, colIndex),
                        animationDelay: `${rowIndex * 100}ms`
                      }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableSkeleton;
