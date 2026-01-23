import Modal from './ui/Modal';
import Button from './ui/Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'destructive' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-error-100 dark:bg-error-900/30 p-3 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 flex-1">{message}</p>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
