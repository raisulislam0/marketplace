"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Milestone {
  id: string;
  title: string;
  description: string;
  estimated_hours: number;
  status: "pending" | "in_progress" | "completed" | "rejected";
  deadline?: string;
  completed_at?: string;
}

interface ProgressTrackerProps {
  milestones: Milestone[];
  progressPercentage: number;
  showControls?: boolean;
  onMilestoneUpdate?: (milestoneId: string, newStatus: string) => Promise<void>;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  milestones,
  progressPercentage,
  showControls = false,
  onMilestoneUpdate,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "in_progress":
        return "⟳";
      case "rejected":
        return "✕";
      default:
        return "○";
    }
  };

  const handleStatusChange = async (milestoneId: string, newStatus: string) => {
    if (!onMilestoneUpdate) return;

    setLoading(milestoneId);
    try {
      await onMilestoneUpdate(milestoneId, newStatus);
    } catch (error) {
      console.error("Failed to update milestone:", error);
    } finally {
      setLoading(null);
    }
  };

  const completedCount = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const totalCount = milestones.length;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Overall Progress</h3>
          <span className="text-lg font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-sm text-gray-600">
          {completedCount} of {totalCount} milestones completed
        </p>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Milestones</h4>

        {milestones.length === 0 ? (
          <p className="text-gray-500 text-sm">No milestones defined yet</p>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${getStatusColor(
                        milestone.status,
                      )}`}
                    >
                      {getStatusIcon(milestone.status)}
                    </div>
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-800">
                      {index + 1}. {milestone.title}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {milestone.description}
                    </p>

                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱ {milestone.estimated_hours} hours</span>
                      {milestone.deadline && (
                        <span>
                          📅 {new Date(milestone.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {milestone.completed_at && (
                        <span>
                          ✓ Completed{" "}
                          {new Date(
                            milestone.completed_at,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Controls */}
                  {showControls && (
                    <div className="flex-shrink-0">
                      {milestone.status === "pending" ? (
                        <button
                          onClick={() =>
                            handleStatusChange(milestone.id, "in_progress")
                          }
                          disabled={loading === milestone.id}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          Start
                        </button>
                      ) : milestone.status === "in_progress" ? (
                        <button
                          onClick={() =>
                            handleStatusChange(milestone.id, "completed")
                          }
                          disabled={loading === milestone.id}
                          className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          Complete
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            milestone.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {milestone.status === "completed"
                            ? "Completed"
                            : "Rejected"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
