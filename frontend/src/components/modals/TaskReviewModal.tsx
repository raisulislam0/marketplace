"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Download } from "lucide-react";
import { Task } from "@/types";
import api from "@/lib/api";

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onReview: (accept: boolean, comment?: string) => void;
}

export default function TaskReviewModal({
  isOpen,
  onClose,
  task,
  onReview,
}: TaskReviewModalProps) {
  const [comment, setComment] = useState("");

  const handleAccept = () => {
    onReview(true, comment);
    setComment("");
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    onReview(false, comment);
    setComment("");
  };

  const handleDownload = async () => {
    if (!task) return;

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
        task.submission_file?.split("/").pop() || "submission.zip",
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download file");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
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
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
          >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800">
                Review Task Submission
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">{task.title}</h3>
                <p className="text-gray-600 text-sm">{task.description}</p>
              </div>

              {task.submission_file && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      <strong>Submitted file:</strong>{" "}
                      {task.submission_file.split("/").pop()}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownload}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comment {!comment.trim() && "(Required for rejection)"}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Provide feedback..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  className="btn-danger flex items-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Accept</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
