"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import api from "@/lib/api";

interface Milestone {
  id: string;
  title: string;
  description: string;
  estimated_hours: number;
  deadline?: string;
  status: string;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  estimated_days: number;
  milestones: Milestone[];
  status: string;
  solver_id: string;
}

interface PlanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  solverName: string;
  onSuccess: () => void;
}

const PlanApprovalModal: React.FC<PlanApprovalModalProps> = ({
  isOpen,
  onClose,
  plan,
  solverName,
  onSuccess,
}) => {
  const addToast = useToastStore((state) => state.addToast);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await api.patch(`/plans/${plan.id}/approve`);
      addToast("Plan approved! Project assigned to solver.", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to approve plan";
      addToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      addToast("Please provide a reason for rejection", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.patch(`/plans/${plan.id}/reject`, {
        reason: rejectionReason,
      });
      addToast("Plan rejected. Solver will be notified.", "info");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to reject plan";
      addToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 border-b">
              <h2 className="text-2xl font-bold">Review Work Plan</h2>
              <p className="text-purple-100 mt-1">
                From: <span className="font-semibold">{solverName}</span>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {plan.title}
                </h3>
                <p className="text-gray-700">{plan.description}</p>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {plan.estimated_days} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Number of Milestones
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {plan.milestones.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Milestones
                </h3>
                <div className="space-y-3">
                  {plan.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id || index}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {index + 1}. {milestone.title}
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {milestone.estimated_hours}h
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {milestone.description}
                      </p>
                      {milestone.deadline && (
                        <p className="text-xs text-gray-600">
                          Deadline:{" "}
                          {new Date(milestone.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decision */}
              {!showRejectForm ? (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                    disabled={isLoading}
                  >
                    Cancel Review
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
                    disabled={isLoading}
                  >
                    Reject Plan
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Approve Plan"}
                  </button>
                </div>
              ) : (
                <motion.div
                  className="p-4 border-2 border-red-300 rounded-lg bg-red-50 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="font-semibold text-red-700">
                    Why are you rejecting this plan?
                  </h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide constructive feedback for the solver..."
                    rows={4}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                      disabled={isLoading}
                    >
                      Keep Reviewing
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                      disabled={isLoading || !rejectionReason.trim()}
                    >
                      {isLoading ? "Rejecting..." : "Send Rejection"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanApprovalModal;
