import { useState } from 'react';
import Card from './ui/Card';
import Table from './ui/Table';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';
import { History, Eye, Download } from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';

const InventoryHistory = ({ history, loading, onViewDetails }) => {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (historyItem) => {
    setSelectedHistory(historyItem);
    setIsDetailsModalOpen(true);
    if (onViewDetails) {
      onViewDetails(historyItem);
    }
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <Card.Body>
          <div className="text-center py-12">
            <Skeleton variant="title" />
            <Skeleton variant="text" />
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card variant="elevated">
        <Card.Body>
          <div className="text-center py-12">
            <History className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No inventory history available
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card variant="elevated">
        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Inventory History
            </h3>
          </div>
          
          <Table
            headers={[
              'Date',
              'Earnings Before',
              'Earnings After',
              'Stock Value',
              'Cost Value',
              'Actions'
            ]}
            data={history}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {new Date(item.performed_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600 dark:text-success-400">
                  ${parseFloat(item.earnings_before_reset || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  ${parseFloat(item.earnings_after_reset || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  ${parseFloat(item.total_stock_value || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  ${parseFloat(item.total_cost_value || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                    icon={Eye}
                  >
                    View
                  </Button>
                </td>
              </>
            )}
          />
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Inventory Details"
      >
        {selectedHistory && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Performed At
                </p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {new Date(selectedHistory.performed_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Period
                </p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {new Date(selectedHistory.period_start_date).toLocaleDateString()} - {new Date(selectedHistory.period_end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Earnings Before Reset
                </p>
                <p className="font-semibold text-success-600 dark:text-success-400">
                  ${parseFloat(selectedHistory.earnings_before_reset || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Earnings After Reset
                </p>
                <p className="font-semibold text-neutral-600 dark:text-neutral-400">
                  ${parseFloat(selectedHistory.earnings_after_reset || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Stock Value
                </p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  ${parseFloat(selectedHistory.total_stock_value || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Cost Value
                </p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  ${parseFloat(selectedHistory.total_cost_value || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {selectedHistory.stock_snapshot && selectedHistory.stock_snapshot.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                  Stock Snapshot ({selectedHistory.stock_snapshot.length} items)
                </p>
                <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <Table
                    headers={['Product', 'Quantity', 'Price', 'Value']}
                    data={selectedHistory.stock_snapshot}
                    renderRow={(item) => (
                      <>
                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">
                          <Badge variant="secondary">{item.quantity}</Badge>
                        </td>
                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">
                          ${parseFloat(item.product_price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-white">
                          ${parseFloat(item.total_value || 0).toFixed(2)}
                        </td>
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            {selectedHistory.notes && (
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                  Notes
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedHistory.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="secondary"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InventoryHistory;
