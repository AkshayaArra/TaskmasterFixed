
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("taskmaster-user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("taskmaster-user");
    navigate("/login");
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
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus size={16} />
            </Button>
          </div>

          <div className="space-y-1">
            <div className="bg-taskmaster-lightPurple text-taskmaster-purple rounded-md p-2 flex items-center">
              <div className="h-6 w-6 bg-taskmaster-purple text-white rounded flex items-center justify-center text-xs mr-2">
                P
              </div>
              <span>Personal</span>
            </div>

            <div className="hover:bg-gray-100 rounded-md p-2 flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded flex items-center justify-center text-xs mr-2">
                T
              </div>
              <span>Team Project</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center justify-between">
              <span>Team Members</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Users size={16} />
              </Button>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-[10px]">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name} (You)</span>
              </div>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-[10px] bg-green-500">
                    A
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">Alex Johnson</span>
              </div>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-[10px] bg-blue-500">
                    S
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">Sam Taylor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Board content */}
        <div className="flex-1 p-6 overflow-auto">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
