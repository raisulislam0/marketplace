"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, RefreshCw } from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";
import { useState } from "react";
import api from "@/lib/api";
import { useToastStore } from "@/store/toastStore";

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  isOwner: boolean;
  onProjectUpdated?: (project: Project) => void;
}

export default function ProjectManagementModal({
  isOpen,
  onClose,
  project,
  isOwner,
  onProjectUpdated,
}: ProjectManagementModalProps) {
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [newStatus, setNewStatus] = useState("");

  if (!project || !isOwner) return null;

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/projects/${project.id}`);
      addToast("Project deleted successfully!", "success");
      onClose();
    } catch (error: any) {
      addToast(
        error.response?.data?.detail || "Failed to delete project",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeadline = async () => {
    if (!newDeadline) {
      addToast("Please select a new deadline", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.patch(`/projects/${project.id}/deadline`, {
        deadline: newDeadline,
      });
      addToast("Deadline updated successfully!", "success");
      onProjectUpdated?.(response.data);
      setNewDeadline("");
    } catch (error: any) {
      addToast(
        error.response?.data?.detail || "Failed to update deadline",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/projects/${project.id}/status`, {
        status,
      });
      addToast("Status updated successfully!", "success");
      onProjectUpdated?.(response.data);
      setNewStatus("");
    } catch (error: any) {
      addToast(
        error.response?.data?.detail || "Failed to update status",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const statuses = ["open", "assigned", "in_progress", "completed", "cancelled"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Project Management
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Change Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Change Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={isLoading || status === project.status}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        status === project.status
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 inline mr-1" />
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Update Deadline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Update Deadline
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Current:{" "}
                    {project.deadline
                      ? format(new Date(project.deadline), "MMM dd, yyyy")
                      : "Not set"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateDeadline}
                      disabled={isLoading || !newDeadline}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Update
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Delete Project */}
              <div className="border-t pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteProject}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Project
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
