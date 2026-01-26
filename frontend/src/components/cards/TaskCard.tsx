'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Upload, CheckCircle, Clock } from 'lucide-react';
import { Task } from '@/types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onStatusChange: (taskId: string, status: string) => void;
  onFileUpload: (taskId: string, file: File) => void;
}

export default function TaskCard({ task, index, onStatusChange, onFileUpload }: TaskCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
      } else {
        alert('Please select a ZIP file');
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(task.id, selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-800">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{task.description}</p>

      {task.deadline && (
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
        </div>
      )}

      {task.status === 'pending' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStatusChange(task.id, 'in_progress')}
          className="w-full btn-primary text-sm flex items-center justify-center space-x-2"
        >
          <Clock className="w-4 h-4" />
          <span>Start Working</span>
        </motion.button>
      )}

      {task.status === 'in_progress' && (
        <div className="space-y-2">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {selectedFile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="w-full btn-primary text-sm flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Task</span>
            </motion.button>
          )}
        </div>
      )}

      {task.status === 'submitted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-xs text-yellow-800">Waiting for review...</p>
        </div>
      )}

      {task.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <p className="text-xs text-green-800">Task completed!</p>
        </div>
      )}

      {task.status === 'rejected' && task.review_comment && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-xs text-red-800 font-medium mb-1">Rejected</p>
          <p className="text-xs text-red-700">{task.review_comment}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="w-full btn-primary text-sm mt-2"
          >
            Revise & Resubmit
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

