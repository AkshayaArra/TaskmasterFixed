import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import TaskColumn from "./TaskColumn";
import { TaskCardProps } from "./TaskCard";
import { PlusCircle, CheckCircle2, CircleDashed, CircleAlert, CircleEllipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskModal from "./TaskModal";
import api from '@/lib/api';
import { Workspace } from "@/services/workspaceService";

// Column definitions for our board
const columns = [
  {
    id: "todo",
    title: "To Do",
    colorClass: "bg-status-todo",
    icon: <CircleDashed size={16} />,
  },
  {
    id: "inProgress",
    title: "In Progress",
    colorClass: "bg-status-inProgress",
    icon: <CircleEllipsis size={16} />,
  },
  {
    id: "blocked",
    title: "Blocked",
    colorClass: "bg-status-blocked",
    icon: <CircleAlert size={16} />,
  },
  {
    id: "done",
    title: "Done",
    colorClass: "bg-status-done",
    icon: <CheckCircle2 size={16} />,
  },
];

const API_URL = 'https://taskmaster-3-41fr.onrender.com/api';

interface KanbanBoardProps {
  workspace: Workspace;
}

const KanbanBoard = ({ workspace }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Record<string, Omit<TaskCardProps, "index">[]>>({
    todo: [],
    inProgress: [],
    blocked: [],
    done: [],
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Omit<TaskCardProps, "index">> | null>(null);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [workspace.id]); // Add workspace.id as dependency

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${workspace.id}`);

      // Reset tasks state with empty arrays before setting new data
      const initialState = {
        todo: [],
        inProgress: [],
        blocked: [],
        done: [],
      };

      // Group tasks by column
      const groupedTasks = response.data.reduce((acc: any, task: any) => {
        if (!acc[task.columnId]) {
          acc[task.columnId] = [];
        }
        acc[task.columnId].push({
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignee: task.assignee,
          commentsCount: task.commentsCount
        });
        return acc;
      }, initialState); // Use initialState instead of empty object

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    try {
      const movedTask = tasks[source.droppableId][source.index];

      await api.put(
        `/tasks/${movedTask.id}/move`,
        {
          sourceColumn: source.droppableId,
          destinationColumn: destination.droppableId,
          newIndex: destination.index
        }
      );

      // Update local state
      const newTasks = { ...tasks };
      newTasks[source.droppableId] = newTasks[source.droppableId].filter(
        (_, idx) => idx !== source.index
      );

      newTasks[destination.droppableId] = [
        ...newTasks[destination.droppableId].slice(0, destination.index),
        movedTask,
        ...newTasks[destination.droppableId].slice(destination.index)
      ];

      setTasks(newTasks);
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert to original state by re-fetching
      fetchTasks();
    }
  };

  const handleSaveTask = async (task: Omit<TaskCardProps, "index">) => {
    if (!currentColumn) return;

    try {
      const taskData = {
        ...task,
        columnId: currentColumn
      };

      if (task.id) {
        // Update existing task
        await api.put(
          `/tasks/${task.id}`,
          taskData
        );
      } else {
        // Create new task
        await api.post(
          `/tasks/${workspace.id}`,
          taskData
        );
      }

      // Refresh tasks
      fetchTasks();
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(
        `/tasks/${taskId}`
      );

      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Kanban Board</h2>

        <Button
          variant="outline"
          className="flex items-center gap-1 bg-white border-taskmaster-purple text-taskmaster-purple hover:bg-taskmaster-lightPurple"
          onClick={() => {
            setCurrentTask({});
            setCurrentColumn("todo");
            setIsTaskModalOpen(true);
          }}
        >
          <PlusCircle size={16} />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full pb-4">
            {columns.map(column => (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={tasks[column.id] || []}
                colorClass={column.colorClass}
                icon={column.icon}
                onAddTask={() => {
                  setCurrentTask({});
                  setCurrentColumn(column.id);
                  setIsTaskModalOpen(true);
                }}
                onEditTask={(taskId) => {
                  const task = Object.values(tasks)
                    .flat()
                    .find(t => t.id === taskId);
                  if (task) {
                    setCurrentTask(task);
                    setCurrentColumn(column.id);
                    setIsTaskModalOpen(true);
                  }
                }}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={currentTask}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
