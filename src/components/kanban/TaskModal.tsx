
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TaskCardProps, TaskPriority } from "./TaskCard";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Partial<Omit<TaskCardProps, "index">> | null;
  onSave: (task: Omit<TaskCardProps, "index">) => void;
}

const TaskModal = ({ isOpen, onClose, task, onSave }: TaskModalProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate);

  // For real-time collaboration in a real app
  const [activePeople, setActivePeople] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.dueDate);
    }
  }, [task]);

  // Mock real-time typing indicator
  useEffect(() => {
    // In a real app, this would be socket-based
    const typingTimeout = setTimeout(() => {
      setIsTyping(null);
    }, 2000);

    return () => clearTimeout(typingTimeout);
  }, [title, description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      id: task?.id || "",
      title,
      description,
      priority,
      dueDate,
      assignee: task?.assignee,
      commentsCount: task?.commentsCount || 0,
    });
  };

  // Mock real-time collaboration
  useEffect(() => {
    // Simulate someone else viewing the task
    const timeout = setTimeout(() => {
      setActivePeople(["Taylor W."]);

      // Simulate typing
      setTimeout(() => {
        setIsTyping("Taylor W.");
      }, 3000);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{task?.id ? "Edit Task" : "Add New Task"}</DialogTitle>

          {activePeople.length > 0 && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <div className="flex -space-x-2 mr-2">
                {activePeople.map((person, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full bg-taskmaster-purple text-white text-[10px] flex items-center justify-center border border-white"
                  >
                    {person.charAt(0)}
                  </div>
                ))}
              </div>
              <span>
                {activePeople.join(", ")} {isTyping ? "is typing..." : "viewing"}
              </span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <RadioGroup
                value={priority}
                onValueChange={(val) => setPriority(val as TaskPriority)}
                className="flex"
              >
                <div className="flex items-center space-x-2 mr-6">
                  <RadioGroupItem
                    value="low"
                    id="priority-low"
                    className="border-green-400 text-green-400"
                  />
                  <Label htmlFor="priority-low" className="text-sm font-normal">Low</Label>
                </div>
                <div className="flex items-center space-x-2 mr-6">
                  <RadioGroupItem
                    value="medium"
                    id="priority-medium"
                    className="border-amber-400 text-amber-400"
                  />
                  <Label htmlFor="priority-medium" className="text-sm font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="high"
                    id="priority-high"
                    className="border-red-400 text-red-400"
                  />
                  <Label htmlFor="priority-high" className="text-sm font-normal">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-taskmaster-purple hover:bg-taskmaster-darkPurple"
            >
              {task?.id ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
