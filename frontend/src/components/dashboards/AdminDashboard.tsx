"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderKanban } from "lucide-react";
import api from "@/lib/api";
import { User, Project } from "@/types";
import ProjectDetailsModal from "@/components/modals/ProjectDetailsModal";
import ProjectManagementModal from "@/components/modals/ProjectManagementModal";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get("/users/"),
        api.get("/projects/"),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (error) {
      console.error("Failed to update role:", error);
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
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage users and oversee all projects</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
            </div>
            <Users className="w-12 h-12 text-primary-600" />
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
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800">
                {projects.length}
              </p>
            </div>
            <FolderKanban className="w-12 h-12 text-primary-600" />
          </div>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          User Management
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "buyer"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                    >
                      <option value="problem_solver" className="text-gray-900">
                        Problem Solver
                      </option>
                      <option value="buyer" className="text-gray-900">
                        Buyer
                      </option>
                      <option value="admin" className="text-gray-900">
                        Admin
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Projects */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Projects Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedProject(project);
                  setShowProjectDetailsModal(true);
                }}
                className="card cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "open"
                        ? "bg-blue-100 text-blue-800"
                        : project.status === "assigned"
                          ? "bg-yellow-100 text-yellow-800"
                          : project.status === "in_progress"
                            ? "bg-purple-100 text-purple-800"
                            : project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status}
                  </span>
                  {project.budget && (
                    <span className="text-sm font-medium text-gray-700">
                      ${project.budget.toLocaleString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <ProjectDetailsModal
        isOpen={showProjectDetailsModal}
        onClose={() => setShowProjectDetailsModal(false)}
        project={selectedProject}
        showManageButton={true}
        showRequestButton={false}
        onManageClick={() => setShowManagementModal(true)}
      />

      <ProjectManagementModal
        isOpen={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        project={selectedProject}
        isOwner={true}
        onProjectUpdated={(updatedProject) => {
          setSelectedProject(updatedProject);
          fetchData();
        }}
        onProjectDeleted={() => {
          setShowManagementModal(false);
          setShowProjectDetailsModal(false);
          setSelectedProject(null);
          fetchData();
        }}
      />
    </div>
  );
}
