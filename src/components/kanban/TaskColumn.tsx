
import { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskCard, { TaskCardProps } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Omit<TaskCardProps, "index">[];
  colorClass?: string;
  icon?: React.ReactNode;
  onAddTask?: () => void;
  onEditTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
}

const TaskColumn = ({
  id,
  title,
  tasks,
  colorClass = "bg-status-todo",
  icon,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="flex flex-col h-full w-[300px] flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-3">
        <div className={cn(
          "flex items-center gap-2 text-sm font-medium rounded-md py-1 px-3", 
          colorClass
        )}>
          {icon}
          <span>{title}</span>
          <span className="bg-white bg-opacity-60 w-5 h-5 flex items-center justify-center rounded-full text-xs">
            {tasks.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-7 w-7 p-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={onAddTask}
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 rounded-md min-h-[200px] transition-colors duration-200",
              snapshot.isDraggingOver 
                ? "bg-taskmaster-lightPurple/50" 
                : "bg-taskmaster-lightGray"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                {...task}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                <p className="text-xs">No tasks yet</p>
                <button 
                  className="mt-2 text-xs text-taskmaster-purple hover:underline"
                  onClick={onAddTask}
                >
                  + Add a task
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;
