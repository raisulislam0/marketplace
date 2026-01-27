"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import api from "@/lib/api";
import { Project } from "@/types";

interface Milestone {
  title: string;
  description: string;
  estimated_hours: number;
  deadline?: string;
}

interface PlanSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  requestId: string;
  onSuccess: () => void;
}

const PlanSubmissionModal: React.FC<PlanSubmissionModalProps> = ({
  isOpen,
  onClose,
  project,
  requestId,
  onSuccess,
}) => {
  const addToast = useToastStore((state) => state.addToast);
  const token = useAuthStore((state) => state.token);

  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", estimated_hours: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", estimated_hours: 0 },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: any,
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const validateForm = () => {
    if (!planTitle.trim()) {
      addToast("Plan title is required", "error");
      return false;
    }

    if (!planDescription.trim()) {
      addToast("Plan description is required", "error");
      return false;
    }

    if (!estimatedDays || parseInt(estimatedDays) <= 0) {
      addToast("Estimated days must be greater than 0", "error");
      return false;
    }

    if (milestones.length === 0) {
      addToast("Add at least one milestone", "error");
      return false;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].title.trim()) {
        addToast(`Milestone ${i + 1}: Title is required`, "error");
        return false;
      }

      if (!milestones[i].description.trim()) {
        addToast(`Milestone ${i + 1}: Description is required`, "error");
        return false;
      }

      if (milestones[i].estimated_hours <= 0) {
        addToast(
          `Milestone ${i + 1}: Estimated hours must be greater than 0`,
          "error",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const planData = {
        request_id: requestId,
        title: planTitle,
        description: planDescription,
        estimated_days: parseInt(estimatedDays),
        milestones: milestones.map((m) => ({
          ...m,
          deadline: m.deadline ? new Date(m.deadline).toISOString() : null,
        })),
      };

      await api.post("/plans/", planData);
      addToast(
        "Plan submitted successfully! Waiting for buyer approval.",
        "success",
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to submit plan";
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
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b">
              <h2 className="text-2xl font-bold">Submit Work Plan</h2>
              <p className="text-blue-100 mt-1">Project: {project.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Plan Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="e.g., UI Design and Implementation Plan"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Description *
                  </label>
                  <textarea
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder="Describe your approach and methodology..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="e.g., 14"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Milestones ({milestones.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Break down your work into measurable milestones. The buyer
                  will track progress based on milestone completion.
                </p>

                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700">
                        Milestone {index + 1}
                      </h4>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(index)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) =>
                            handleMilestoneChange(
                              index,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Wireframe Design"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={milestone.description}
                          onChange={(e) =>
                            handleMilestoneChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Describe what will be delivered..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Hours *
                          </label>
                          <input
                            type="number"
                            value={milestone.estimated_hours}
                            onChange={(e) =>
                              handleMilestoneChange(
                                index,
                                "estimated_hours",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder="e.g., 20"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={milestone.deadline || ""}
                            onChange={(e) =>
                              handleMilestoneChange(
                                index,
                                "deadline",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="w-full px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
                >
                  + Add Milestone
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Plan"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanSubmissionModal;
