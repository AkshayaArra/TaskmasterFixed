import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Plus, LogOut, UserCog, Users, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchWorkspaces, createWorkspace, Workspace } from "@/services/workspaceService";
import TeamMembersModal from "@/components/Members";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isTeamMembersModalOpen, setIsTeamMembersModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("taskmaster-user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  useEffect(() => {
    // Fetch workspaces when component mounts
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      const data = await fetchWorkspaces();
      console.log('Loaded workspaces:', data); // Debug log
      setWorkspaces(data);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast.error('Failed to load workspaces');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("taskmaster-user");
    navigate("/login");
  };

  const handleCreateWorkspace = async () => {
    try {
      setIsLoading(true);
      await createWorkspace(newWorkspaceName);
      await loadWorkspaces();
      setNewWorkspaceName("");
      setIsNewWorkspaceModalOpen(false);
      toast.success('Workspace created successfully');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-taskmaster-purple flex items-center">
              <span className="bg-taskmaster-purple text-white rounded p-1 text-sm mr-2">TM</span>
              TaskMaster
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-taskmaster-purple text-taskmaster-purple hover:bg-taskmaster-lightPurple"
              onClick={() => setIsNewWorkspaceModalOpen(true)}
            >
              <Plus size={16} />
              <span>New Workspace</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-taskmaster-purple text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span>{user.name}</span>
                  </div>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <UserCog size={16} />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings size={16} />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-500 focus:text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-taskmaster-lightGray border-r border-gray-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-gray-800">Workspaces</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsNewWorkspaceModalOpen(true)}
            >
              <Plus size={16} />
            </Button>
          </div>

          <div className="space-y-1">
            {workspaces.map((workspace) => {
              const isSelected = selectedWorkspace?.id === workspace.id;

              return (
                <button
                  key={workspace.id}
                  className={`w-full rounded-md p-2 flex items-center cursor-pointer transition-all ${isSelected
                    ? 'bg-taskmaster-purple bg-opacity-10 ring-1 ring-taskmaster-purple'
                    : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  onClick={() => {
                    setSelectedWorkspace(workspace);
                  }}
                >
                  <div
                    className={`h-6 w-6 rounded flex items-center justify-center text-xs mr-2 ${isSelected
                      ? 'bg-taskmaster-purple text-white shadow-sm'
                      : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`${isSelected ? 'font-medium text-taskmaster-purple' : 'text-gray-700'}`}>
                    {workspace.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center justify-between">
              <span>Team Members</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => selectedWorkspace && setIsTeamMembersModalOpen(true)}
                disabled={!selectedWorkspace}
              >
                <Users size={16} />
              </Button>
            </h3>

            <div className="space-y-2">
              {selectedWorkspace?.members.map((member) => (
                <div key={member.user.id} className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-[10px] bg-green-500">
                      {member.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {member.user.name}
                    {member.user.id === user.id && " (You)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Board content */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedWorkspace ? (
            <KanbanBoard workspace={selectedWorkspace} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-xl mb-2">No Workspace Selected</div>
              <p className="text-sm">
                Please select a workspace from the sidebar to view tasks
              </p>
              {workspaces.length === 0 && (
                <Button
                  className="mt-4 bg-taskmaster-purple hover:bg-taskmaster-darkPurple"
                  onClick={() => setIsNewWorkspaceModalOpen(true)}
                >
                  Create Your First Workspace
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Workspace Modal */}
      <Dialog
        open={isNewWorkspaceModalOpen}
        onOpenChange={(open) => setIsNewWorkspaceModalOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewWorkspaceModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              className="bg-taskmaster-purple hover:bg-taskmaster-darkPurple"
              disabled={!newWorkspaceName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedWorkspace && (
        <TeamMembersModal
          isOpen={isTeamMembersModalOpen}
          onClose={() => setIsTeamMembersModalOpen(false)}
          workspaceId={selectedWorkspace.id}
          members={selectedWorkspace.members}
          onMembersChange={loadWorkspaces}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default Dashboard;
