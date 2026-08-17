import React, { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const ConfirmWithdrawModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  applicationTitle = 'this job application',
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmClick = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Application Withdrawal"
      size="sm"
    >
      <div className="space-y-5 text-xs sm:text-sm">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-200 text-sm">Are you sure you want to withdraw?</h4>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Withdrawing your application for <strong className="text-slate-100">{applicationTitle}</strong> cannot be undone. You will need to re-apply if the position remains open.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={loading}
            disabled={loading}
            onClick={handleConfirmClick}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Confirm Withdrawal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmWithdrawModal;
