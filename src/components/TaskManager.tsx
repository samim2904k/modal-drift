import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import { Task, Priority, TaskFormData, Status } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Sample data
const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Design system components',
    assignedTo: 'Sarah Johnson',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    priority: 'high',
    status: 'todo',
    images: [],
    description: 'Create reusable components for the design system',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'API integration',
    assignedTo: 'Mike Chen',
    startDate: '2024-01-18',
    endDate: '2024-01-30',
    priority: 'urgent',
    status: 'todo',
    images: [],
    description: 'Integrate third-party APIs',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
  {
    id: '3',
    name: 'Documentation update',
    assignedTo: 'Emily Davis',
    startDate: '2024-01-20',
    endDate: '2024-02-05',
    priority: 'low',
    status: 'todo',
    images: [],
    description: 'Update project documentation',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z',
  },
];

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultPriority, setDefaultPriority] = useState<Priority>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesDate = !dateFilter || 
      new Date(task.createdAt).toDateString() === dateFilter.toDateString();
    return matchesSearch && matchesStatus && matchesDate;
  });

  const groupedTasks = {
    urgent: filteredTasks.filter(task => task.priority === 'urgent'),
    high: filteredTasks.filter(task => task.priority === 'high'),
    medium: filteredTasks.filter(task => task.priority === 'medium'),
    low: filteredTasks.filter(task => task.priority === 'low'),
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column (priority)
    const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
    if (priorities.includes(overId as Priority)) {
      const newPriority = overId as Priority;
      if (activeTask.priority !== newPriority) {
        setTasks(prev => prev.map(task =>
          task.id === activeId
            ? { ...task, priority: newPriority, updatedAt: new Date().toISOString() }
            : task
        ));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    // If dropping on another task, reorder within the same priority
    if (overTask && activeTask.priority === overTask.priority) {
      const priorityTasks = tasks.filter(t => t.priority === activeTask.priority);
      const activeIndex = priorityTasks.findIndex(t => t.id === activeId);
      const overIndex = priorityTasks.findIndex(t => t.id === overId);

      if (activeIndex !== overIndex) {
        const reorderedTasks = arrayMove(priorityTasks, activeIndex, overIndex);
        const otherTasks = tasks.filter(t => t.priority !== activeTask.priority);
        setTasks([...otherTasks, ...reorderedTasks]);
      }
    }
  };

  const handleAddTask = useCallback((priority: Priority) => {
    setDefaultPriority(priority);
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast({
      title: "Task Deleted",
      description: `Task "${task?.name}" has been deleted successfully.`,
    });
  }, [tasks]);

  const handleStatusUpdate = useCallback((taskId: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ));
    toast({
      title: "Status Updated",
      description: `Task "${task?.name}" moved to ${newStatus}.`,
    });
  }, [tasks]);

  const handleSaveTask = useCallback((taskData: TaskFormData, images: string[]) => {
    const timestamp = new Date().toISOString();
    
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              ...taskData,
              images,
              updatedAt: timestamp,
            }
          : task
      ));
    } else {
      // Create new task
      const newTask: Task = {
        id: generateId(),
        ...taskData,
        status: 'todo',
        images,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setTasks(prev => [...prev, newTask]);
    }
  }, [editingTask]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize tasks by priority with drag & drop
            </p>
          </div>
          <Button onClick={() => handleAddTask('medium')} size="lg" className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gradient-card border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal bg-gradient-card border-border/50",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDateFilter(undefined)}
                  className="w-full"
                >
                  Clear Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-gradient-card border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(groupedTasks).map(([priority, tasks]) => (
            <div key={priority} className="bg-card rounded-lg p-4 shadow-card">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {priority} Priority
              </div>
            </div>
          ))}
        </div>

        {/* Task Columns */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(groupedTasks) as Priority[]).map((priority) => (
              <TaskColumn
                key={priority}
                priority={priority}
                tasks={groupedTasks[priority]}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onStatusUpdate={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
          defaultPriority={defaultPriority}
        />
      </div>
    </div>
  );
}