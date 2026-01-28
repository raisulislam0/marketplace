"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  ListTodo,
  User,
  Briefcase,
  Award,
  ExternalLink,
} from "lucide-react";
import api from "@/lib/api";
import { Project, Task } from "@/types";
import ProjectCard from "@/components/cards/ProjectCard";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import TaskCard from "@/components/cards/TaskCard";
import ProfileModal from "@/components/modals/ProfileModal";
import ProjectDetailsModal from "@/components/modals/ProjectDetailsModal";
import ProjectManagementModal from "@/components/modals/ProjectManagementModal";
import PlanSubmissionModal from "@/components/modals/PlanSubmissionModal";
import SearchBar from "@/components/common/SearchBar";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export default function ProblemSolverDashboard() {
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showPlanSubmissionModal, setShowPlanSubmissionModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (searchQuery?: string) => {
    try {
      const url = searchQuery
        ? `/projects/search/?q=${encodeURIComponent(searchQuery)}`
        : "/projects/";
      const response = await api.get(url);
      const allProjects = response.data;
      setProjects(allProjects.filter((p: Project) => p.status === "open"));
      setMyProjects(allProjects.filter((p: Project) => p.status !== "open"));

      // Fetch tasks for assigned projects
      if (allProjects.filter((p: Project) => p.status !== "open").length > 0) {
        const assignedProject = allProjects.find(
          (p: Project) => p.status !== "open",
        );
        if (assignedProject) {
          fetchTasks(assignedProject.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    fetchProjects(query);
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetailsModal(true);
  };

  const handleRequestProject = async (projectId: string) => {
    try {
      console.log("handleRequestProject called with projectId:", projectId);
      console.log("projectId type:", typeof projectId);
      console.log("selectedProject:", selectedProject);

      if (!projectId) {
        console.error("ERROR: Project ID is missing or undefined!");
        addToast("Project ID is missing", "error");
        return;
      }

      console.log("Sending request for project:", projectId);

      const response = await api.post("/requests/", {
        project_id: projectId,
        message: "I would like to work on this project",
      });

      console.log("Request successful:", response.data);

      // Store request ID and show plan submission modal
      setCurrentRequestId(response.data.id);
      setShowPlanSubmissionModal(true);
      setShowProjectDetailsModal(false);

      addToast("Request created! Now submit your work plan.", "success");
    } catch (error: any) {
      console.error("Request failed:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to send request";
      addToast(errorMessage, "error");
    }
  };

  const handleCreateTask = (project: Project) => {
    setSelectedProject(project);
    setShowCreateTaskModal(true);
  };

  const handleTaskCreated = () => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
    }
  };

  const handleTaskUpdate = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleFileUpload = async (taskId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/tasks/${taskId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
      addToast("Task submitted successfully!", "success");
    } catch (error: any) {
      addToast(
        error.response?.data?.detail || "Failed to submit task",
        "error",
      );
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Problem Solver Dashboard
          </h1>
          <p className="text-gray-600">Browse projects and manage your tasks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProfileModal(true)}
          className="btn-secondary flex items-center space-x-2"
        >
          <User className="w-5 h-5" />
          <span>Edit Profile</span>
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SearchBar
          placeholder="Search projects by title or description..."
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </motion.div>

      {/* Profile Section */}
      {user?.profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          </div>

          {user.profile.bio && (
            <div className="mb-4">
              <p className="text-gray-700">{user.profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.profile.skills && user.profile.skills.length > 0 && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.profile.experience_years && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>Experience</span>
                </div>
                <p className="text-gray-700">
                  {user.profile.experience_years}{" "}
                  {user.profile.experience_years === 1 ? "year" : "years"}
                </p>
              </div>
            )}

            {user.profile.portfolio_url && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span>Portfolio</span>
                </div>
                <a
                  href={user.profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {user.profile.portfolio_url}
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}

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
              <p className="text-gray-600 text-sm">Available Projects</p>
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
              <p className="text-gray-600 text-sm">My Projects</p>
              <p className="text-3xl font-bold text-gray-800">
                {myProjects.length}
              </p>
            </div>
            <FolderKanban className="w-12 h-12 text-green-600" />
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
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
            </div>
            <ListTodo className="w-12 h-12 text-blue-600" />
          </div>
        </motion.div>
      </div>

      {/* My Projects & Tasks */}
      {myProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            My Projects & Tasks
          </h2>
          {myProjects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCreateTask(project)}
                  className="btn-primary"
                >
                  Add Task
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {tasks
                  .filter((t) => t.project_id === project.id)
                  .map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onStatusChange={handleTaskUpdate}
                      onFileUpload={handleFileUpload}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Projects */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Available Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        project={selectedProject}
        onSuccess={handleTaskCreated}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ProjectDetailsModal
        isOpen={showProjectDetailsModal}
        onClose={() => setShowProjectDetailsModal(false)}
        project={selectedProject}
        onRequestWork={handleRequestProject}
        showRequestButton={selectedProject?.status === "open"}
        showManageButton={
          user?.role === "admin" || user?.id === selectedProject?.buyer_id
        }
        onManageClick={() => setShowManagementModal(true)}
      />

      <ProjectManagementModal
        isOpen={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        project={selectedProject}
        isOwner={
          user?.role === "admin" || user?.id === selectedProject?.buyer_id
        }
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

      {selectedProject && currentRequestId && (
        <PlanSubmissionModal
          isOpen={showPlanSubmissionModal}
          onClose={() => setShowPlanSubmissionModal(false)}
          project={selectedProject}
          requestId={currentRequestId}
          onSuccess={() => {
            setShowPlanSubmissionModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
