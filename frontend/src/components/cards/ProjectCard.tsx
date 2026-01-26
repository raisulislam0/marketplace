'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, CheckCircle, Clock, Send } from 'lucide-react';
import { Project, Task } from '@/types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
  tasks?: Task[];
  onReviewTask?: (task: Task) => void;
  showRequestButton?: boolean;
}

export default function ProjectCard({ 
  project, 
  onClick, 
  index, 
  tasks = [],
  onReviewTask,
  showRequestButton = false
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      className="card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{project.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-2 mb-4">
        {project.budget && (
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>${project.budget.toLocaleString()}</span>
          </div>
        )}
        {project.deadline && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
          </div>
        )}
      </div>

      {project.requirements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Requirements:</p>
          <div className="flex flex-wrap gap-1">
            {project.requirements.slice(0, 3).map((req, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {req}
              </span>
            ))}
            {project.requirements.length > 3 && (
              <span className="text-xs text-gray-500">+{project.requirements.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Tasks ({tasks.length})</p>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  if (task.status === 'submitted' && onReviewTask) {
                    onReviewTask(task);
                  }
                }}
              >
                <span className="text-xs text-gray-700 truncate flex-1">{task.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getTaskStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRequestButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full mt-4 btn-primary flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Request to Work</span>
        </motion.button>
      )}
    </motion.div>
  );
}

