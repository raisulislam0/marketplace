"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import { Task } from "@/types";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToastStore } from "@/store/toastStore";

interface TaskDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projectTitle: string;
}

export default function TaskDownloadModal({
  isOpen,
  onClose,
  tasks,
  projectTitle,
}: TaskDownloadModalProps) {
  const { addToast } = useToastStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleDownload = async (task: Task) => {
    try {
      const response = await api.get(`/tasks/${task.id}/download`, {
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        task.submission_file?.split("/").pop() || `${task.title}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast("File downloaded successfully!", "success");
    } catch (error: any) {
      console.error("Failed to download file:", error);
      addToast(
        error.response?.data?.detail || "Failed to download file",
        "error",
      );
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const otherTasks = tasks.filter((t) => t.status !== "completed");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Project Tasks</h2>
                <p className="text-blue-100 mt-1">{projectTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No tasks available for this project
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Completed Tasks Section */}
                  {completedTasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Completed Tasks ({completedTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {completedTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-green-50"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(task.status)}
                                  <h4 className="font-semibold text-gray-800">
                                    {task.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {task.description}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  {task.deadline && (
                                    <span>
                                      Deadline:{" "}
                                      {format(
                                        new Date(task.deadline),
                                        "MMM dd, yyyy",
                                      )}
                                    </span>
                                  )}
                                  {task.submission_date && (
                                    <span>
                                      Submitted:{" "}
                                      {format(
                                        new Date(task.submission_date),
                                        "MMM dd, yyyy",
                                      )}
                                    </span>
                                  )}
                                </div>
                                {task.review_comment && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                                    <strong>Review:</strong>{" "}
                                    {task.review_comment}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </span>
                                {task.submission_file && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDownload(task)}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Tasks Section */}
                  {otherTasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FileText className="w-5 h-5 text-gray-600 mr-2" />
                        Other Tasks ({otherTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {otherTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(task.status)}
                                  <h4 className="font-semibold text-gray-800">
                                    {task.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {task.description}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  {task.deadline && (
                                    <span>
                                      Deadline:{" "}
                                      {format(
                                        new Date(task.deadline),
                                        "MMM dd, yyyy",
                                      )}
                                    </span>
                                  )}
                                  {task.submission_date && (
                                    <span>
                                      Submitted:{" "}
                                      {format(
                                        new Date(task.submission_date),
                                        "MMM dd, yyyy",
                                      )}
                                    </span>
                                  )}
                                </div>
                                {task.review_comment && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                                    <strong>Review:</strong>{" "}
                                    {task.review_comment}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </span>
                                {task.submission_file &&
                                  task.status === "submitted" && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleDownload(task)}
                                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span>Download</span>
                                    </motion.button>
                                  )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
