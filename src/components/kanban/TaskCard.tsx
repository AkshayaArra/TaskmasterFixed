
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, MoreHorizontal, Clock } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export type TaskPriority = "low" | "medium" | "high";

export interface TaskCardProps {
  id: string;
  index: number;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: Date;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  commentsCount?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

const TaskCard = ({
  id,
  index,
  title,
  description,
  priority,
  dueDate,
  assignee,
  commentsCount = 0,
  onEdit,
  onDelete
}: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? "opacity-75" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Card className="border-l-4 bg-white hover:shadow-md transition-shadow duration-200" 
                style={{ borderLeftColor: `var(--priority-${priority})` }}>
            <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
              <CardTitle className="text-sm font-medium leading-tight">{title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(id)}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500" 
                    onClick={() => onDelete?.(id)}
                  >
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="p-3 pt-2">
              <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
            </CardContent>
            
            <CardFooter className="p-3 pt-0 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-2 py-0 border ${
                    priority === 'high' 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : priority === 'medium'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-green-50 text-green-600 border-green-200'
                  }`}
                >
                  {priorityLabels[priority]}
                </Badge>
                
                {dueDate && (
                  <div className="flex items-center text-[10px] text-gray-500">
                    <Clock size={10} className="mr-1" />
                    {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {commentsCount > 0 && (
                  <div className="flex items-center text-[10px] text-gray-500">
                    <MessageSquare size={10} className="mr-1" />
                    {commentsCount}
                  </div>
                )}
                
                {assignee && (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback className="text-[10px]">
                      {assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
