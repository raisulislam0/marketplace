"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Request } from "@/types";

interface RequestsListProps {
  isOpen: boolean;
  onClose: () => void;
  requests: Request[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function RequestsList({
  isOpen,
  onClose,
  requests,
  onAccept,
  onReject,
}: RequestsListProps) {
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
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800">
                Project Requests ({requests.length})
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {requests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No requests yet
                </p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="text-sm font-semibold text-gray-800">
                              {request.solver_name || request.solver_id}
                            </p>
                            {request.solver_email && (
                              <p className="text-xs text-gray-600">
                                {request.solver_email}
                              </p>
                            )}
                          </div>
                          {request.message && (
                            <p className="text-gray-700">{request.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex space-x-2 ml-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onAccept(request.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Accept"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onReject(request.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </motion.button>
                          </div>
                        )}

                        {request.status !== "pending" && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
