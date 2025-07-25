import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, ImageIcon, MoreVertical, CheckCircle, Clock, Play } from 'lucide-react';
import { Task, Status } from '@/types/task';
import { createElement } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, newStatus: Status) => void;
}

const priorityColors = {
  urgent: 'bg-priority-urgent text-priority-urgent-foreground',
  high: 'bg-priority-high text-priority-high-foreground',
  medium: 'bg-priority-medium text-priority-medium-foreground',
  low: 'bg-priority-low text-priority-low-foreground',
};

const priorityBorderColors = {
  urgent: 'border-l-priority-urgent',
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
};

const statusConfig = {
  todo: { label: 'To Do', icon: Clock, color: 'text-amber-400' },
  progress: { label: 'In Progress', icon: Play, color: 'text-blue-400' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400' },
};

export function TaskCard({ task, onEdit, onDelete, onStatusUpdate }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'completed';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 cursor-move shadow-task hover:shadow-elegant transition-all duration-300 group",
        "border-l-4 bg-gradient-card backdrop-blur-sm border border-border/20",
        priorityBorderColors[task.priority],
        isDragging && "opacity-50 rotate-2 scale-105 shadow-glow",
        isOverdue && "ring-2 ring-destructive/50 shadow-destructive/25"
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {task.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit Task
              </DropdownMenuItem>
              {task.status !== 'todo' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'todo')}>
                  Mark as To Do
                </DropdownMenuItem>
              )}
              {task.status !== 'progress' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'progress')}>
                  Mark as In Progress
                </DropdownMenuItem>
              )}
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'completed')}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority and Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs font-medium", priorityColors[task.priority])}>
              {task.priority.toUpperCase()}
            </Badge>
            <div className={cn("flex items-center gap-1 text-xs", statusConfig[task.status].color)}>
              {createElement(statusConfig[task.status].icon, { className: "h-3 w-3" })}
              <span className="font-medium">{statusConfig[task.status].label}</span>
            </div>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              OVERDUE
            </Badge>
          )}
        </div>

        {/* Assigned To */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="text-xs truncate">{task.assignedTo}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.startDate)}</span>
          </div>
          <span>→ {formatDate(task.endDate)}</span>
        </div>

        {/* Images */}
        {task.images.length > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            <span className="text-xs">{task.images.length} image(s)</span>
          </div>
        )}
      </div>
    </Card>
  );
}