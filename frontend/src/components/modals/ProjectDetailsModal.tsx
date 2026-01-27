"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  DollarSign,
  User as UserIcon,
  CheckCircle,
  Send,
  Settings,
} from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onRequestWork?: (projectId: string) => void;
  showRequestButton?: boolean;
  showManageButton?: boolean;
  onManageClick?: () => void;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  onRequestWork,
  showRequestButton = false,
  showManageButton = false,
  onManageClick,
}: ProjectDetailsModalProps) {
  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-800">
                  {project.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.budget && (
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Budget
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {project.deadline && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Deadline
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {format(new Date(project.deadline), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Buyer ID
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {project.buyer_id}
                    </p>
                  </div>
                </div>

                {project.assigned_solver_id && (
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Assigned Solver
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {project.assigned_solver_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {project.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Requirements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {format(new Date(project.created_at), "MMM dd, yyyy HH:mm")}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {format(new Date(project.updated_at), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </div>

              {/* Manage Button for Owner */}
              {showManageButton && onManageClick && (
                <div className="border-t pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onManageClick}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Manage Project</span>
                  </motion.button>
                </div>
              )}

              {/* Request Button */}
              {showRequestButton && onRequestWork && (
                <div className="border-t pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log(
                        "Request button clicked for project:",
                        project,
                      );
                      console.log("Project ID:", project.id);
                      console.log("Project ID type:", typeof project.id);
                      if (!project.id) {
                        console.error(
                          "ERROR: Project ID is missing or undefined!",
                        );
                      }
                      onRequestWork(project.id);
                    }}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                  >
                    <Send className="w-5 h-5" />
                    <span>Request to Work on This Project</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
