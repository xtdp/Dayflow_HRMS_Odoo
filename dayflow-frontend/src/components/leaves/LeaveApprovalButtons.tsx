"use client";

import { useState } from 'react';
import { leaveService } from '@/services/leaveService';
import { Button } from '@/components/ui/Button';
import { Check, X } from 'lucide-react';

interface Props {
  leaveId: number;
  onSuccess: () => void;
}

export function LeaveApprovalButtons({ leaveId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleApprove = async () => {
    if (showCommentBox && action === 'approve') {
      setLoading(true);
      try {
        await leaveService.approveLeave(leaveId, comment);
        onSuccess();
        setShowCommentBox(false);
        setComment('');
      } catch (err) {
        alert('Failed to approve leave');
      } finally {
        setLoading(false);
      }
    } else {
      setAction('approve');
      setShowCommentBox(true);
    }
  };

  const handleReject = async () => {
    if (showCommentBox && action === 'reject') {
      if (!comment.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      setLoading(true);
      try {
        await leaveService.rejectLeave(leaveId, comment);
        onSuccess();
        setShowCommentBox(false);
        setComment('');
      } catch (err) {
        alert('Failed to reject leave');
      } finally {
        setLoading(false);
      }
    } else {
      setAction('reject');
      setShowCommentBox(true);
    }
  };

  const handleCancel = () => {
    setShowCommentBox(false);
    setComment('');
    setAction(null);
  };

  if (showCommentBox) {
    return (
      <div className="space-y-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={action === 'reject' ? 'Reason for rejection (required)' : 'Add a comment (optional)'}
          className="w-full px-3 py-2 bg-dayflow-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-dayflow-primary resize-none"
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            onClick={action === 'approve' ? handleApprove : handleReject}
            isLoading={loading}
            className="flex-1"
            variant={action === 'approve' ? 'primary' : 'secondary'}
          >
            Confirm {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        <Check size={16} className="mr-2" />
        Approve
      </Button>
      <Button
        onClick={handleReject}
        variant="secondary"
        className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500"
      >
        <X size={16} className="mr-2" />
        Reject
      </Button>
    </div>
  );
}