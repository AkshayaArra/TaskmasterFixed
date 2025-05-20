import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Member {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
}

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  members: Member[];
  onMembersChange: () => void;
  currentUserId: string;
}

export default function TeamMembersModal({
  isOpen,
  onClose,
  workspaceId,
  members,
  onMembersChange,
  currentUserId,
}: TeamMembersModalProps) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      setIsLoading(true);
      await api.post(`/workspaces/${workspaceId}/members`, {
        email: newMemberEmail,
      });
      
      toast.success("Member invited successfully");
      setNewMemberEmail("");
      onMembersChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to invite member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      toast.success("Member removed successfully");
      onMembersChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Invite New Member</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <Button
                onClick={handleInviteMember}
                disabled={isLoading || !newMemberEmail.trim()}
              >
                Invite
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Label>Current Members</Label>
            <div className="mt-2 space-y-2">
              {members.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {member.user.email}
                      </span>
                    </div>
                  </div>
                  {member.user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveMember(member.user.id)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
