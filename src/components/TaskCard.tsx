import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, ImageIcon, MoreVertical } from 'lucide-react';
import { Task } from '@/types/task';
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

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
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
        "p-4 cursor-move shadow-task hover:shadow-lg transition-all duration-300",
        "border-l-4 bg-gradient-card",
        priorityBorderColors[task.priority],
        isDragging && "opacity-50 rotate-2 scale-105",
        isOverdue && "ring-2 ring-destructive/50"
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
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <Badge className={cn("text-xs font-medium", priorityColors[task.priority])}>
            {task.priority.toUpperCase()}
          </Badge>
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