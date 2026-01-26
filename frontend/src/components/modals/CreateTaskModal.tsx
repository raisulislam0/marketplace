'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { Project } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, project, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;

    try {
      await api.post('/tasks/', {
        project_id: project.id,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline || null,
      });
      
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', deadline: '' });
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
          >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

