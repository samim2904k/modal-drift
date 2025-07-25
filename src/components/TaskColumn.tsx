import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task, Priority, Status } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  priority: Priority;
  tasks: Task[];
  onAddTask: (priority: Priority) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusUpdate: (taskId: string, newStatus: Status) => void;
}

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    color: 'border-priority-urgent bg-priority-urgent/5',
    headerColor: 'text-priority-urgent',
    count: 0,
  },
  high: {
    label: 'High Priority',
    color: 'border-priority-high bg-priority-high/5',
    headerColor: 'text-priority-high',
    count: 0,
  },
  medium: {
    label: 'Medium Priority',
    color: 'border-priority-medium bg-priority-medium/5',
    headerColor: 'text-priority-medium',
    count: 0,
  },
  low: {
    label: 'Low Priority',
    color: 'border-priority-low bg-priority-low/5',
    headerColor: 'text-priority-low',
    count: 0,
  },
};

export function TaskColumn({ priority, tasks, onAddTask, onEditTask, onDeleteTask, onStatusUpdate }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
  });

  const config = priorityConfig[priority];
  const taskIds = tasks.map(task => task.id);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "p-6 min-h-[500px] transition-all duration-300 rounded-xl shadow-elegant border-2 border-dashed backdrop-blur-sm",
        config.color,
        "hover:shadow-glow",
        isOver && "border-solid shadow-primary/25 scale-[1.02] bg-primary/10"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className={cn("font-bold text-lg", config.headerColor)}>
            {config.label}
          </h2>
          <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(priority)}
          className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200 rounded-lg"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 group">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusUpdate={onStatusUpdate}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Add your first {priority} priority task</p>
            </div>
          )}
        </div>
      </SortableContext>
    </Card>
  );
}