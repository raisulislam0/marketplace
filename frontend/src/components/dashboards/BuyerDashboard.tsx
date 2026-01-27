"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderKanban, Users, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { Project, Request, Task } from "@/types";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import ProjectCard from "@/components/cards/ProjectCard";
import RequestsList from "@/components/lists/RequestsList";
import TaskReviewModal from "@/components/modals/TaskReviewModal";
import ProjectDetailsModal from "@/components/modals/ProjectDetailsModal";
import ProjectManagementModal from "@/components/modals/ProjectManagementModal";
import PlanApprovalModal from "@/components/modals/PlanApprovalModal";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export default function BuyerDashboard() {
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showTaskReviewModal, setShowTaskReviewModal] = useState(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showPlanApprovalModal, setShowPlanApprovalModal] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedSolverName, setSelectedSolverName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (projectId: string) => {
    try {
      const response = await api.get(`/requests/project/${projectId}`);
      setRequests(response.data);
    } catch (error: any) {
      console.error("Failed to fetch requests:", error);
      addToast(
        error.response?.data?.detail || "Failed to fetch requests",
        "error",
      );
      setRequests([]);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      setTasks(response.data);
    } catch (error: any) {
      console.error("Failed to fetch tasks:", error);
      addToast(
        error.response?.data?.detail || "Failed to fetch tasks",
        "error",
      );
      setTasks([]);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    await fetchTasks(project.id);
    if (project.status === "open") {
      await fetchRequests(project.id);
      setShowRequestsModal(true);
    } else {
      setShowProjectDetailsModal(true);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "accepted" });
      setShowRequestsModal(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "rejected" });
      fetchRequests(selectedProject!.id);
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleReviewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskReviewModal(true);
  };

  const handleTaskReview = async (accept: boolean, comment?: string) => {
    if (!selectedTask) return;

    try {
      await api.post(`/tasks/${selectedTask.id}/review`, null, {
        params: { accept, comment },
      });
      setShowTaskReviewModal(false);
      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
    } catch (error) {
      console.error("Failed to review task:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const openProjects = projects.filter((p) => p.status === "open");
  const assignedProjects = projects.filter((p) => p.status !== "open");

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Buyer Dashboard
          </h1>
          <p className="text-gray-600">Create and manage your projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Project</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800">
                {projects.length}
              </p>
            </div>
            <FolderKanban className="w-12 h-12 text-primary-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open Projects</p>
              <p className="text-3xl font-bold text-gray-800">
                {openProjects.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-800">
                {assignedProjects.length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
              index={index}
              tasks={selectedProject?.id === project.id ? tasks : []}
              onReviewTask={handleReviewTask}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchProjects}
      />

      <RequestsList
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        requests={requests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      <TaskReviewModal
        isOpen={showTaskReviewModal}
        onClose={() => setShowTaskReviewModal(false)}
        task={selectedTask}
        onReview={handleTaskReview}
      />

      <ProjectDetailsModal
        isOpen={showProjectDetailsModal}
        onClose={() => setShowProjectDetailsModal(false)}
        project={selectedProject}
        showManageButton={user?.id === selectedProject?.buyer_id}
        onManageClick={() => setShowManagementModal(true)}
      />

      <ProjectManagementModal
        isOpen={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        project={selectedProject}
        isOwner={user?.id === selectedProject?.buyer_id}
        onProjectUpdated={(updatedProject) => {
          setSelectedProject(updatedProject);
          fetchProjects();
        }}
        onProjectDeleted={() => {
          setShowManagementModal(false);
          setShowProjectDetailsModal(false);
          setSelectedProject(null);
          fetchProjects();
        }}
      />

      {selectedPlan && (
        <PlanApprovalModal
          isOpen={showPlanApprovalModal}
          onClose={() => setShowPlanApprovalModal(false)}
          plan={selectedPlan}
          solverName={selectedSolverName}
          onSuccess={() => {
            setShowPlanApprovalModal(false);
            // Refresh plans
            if (selectedProject) {
              fetchRequests(selectedProject.id);
            }
          }}
        />
      )}
    </div>
  );
}
