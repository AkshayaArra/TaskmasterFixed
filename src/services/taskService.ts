
import { TaskCardProps } from "../components/kanban/TaskCard";
import API_URL from "../config/api";

// Define task interface matching what's on backend
export interface Task extends Omit<TaskCardProps, "index"> {
  columnId: string;
}

// Fetch all tasks for the current user
export const fetchTasks = async (): Promise<Record<string, Task[]>> => {
  try {
    const token = localStorage.getItem("taskmaster-token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();
    
    // Group tasks by columnId
    const groupedTasks: Record<string, Task[]> = {
      todo: [],
      inProgress: [],
      blocked: [],
      done: []
    };
    
    tasks.forEach((task: Task) => {
      const column = task.columnId || "todo";
      if (!groupedTasks[column]) {
        groupedTasks[column] = [];
      }
      groupedTasks[column].push(task);
    });
    
    return groupedTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Create a new task
export const createTask = async (task: Omit<Task, "id">, columnId: string): Promise<Task> => {
  try {
    const token = localStorage.getItem("taskmaster-token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...task, columnId })
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  try {
    const token = localStorage.getItem("taskmaster-token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const token = localStorage.getItem("taskmaster-token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Move a task from one column to another
export const moveTask = async (taskId: string, sourceColumn: string, destinationColumn: string, newIndex: number): Promise<void> => {
  try {
    const token = localStorage.getItem("taskmaster-token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/tasks/${taskId}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sourceColumn,
        destinationColumn,
        newIndex
      })
    });

    if (!response.ok) {
      throw new Error("Failed to move task");
    }
  } catch (error) {
    console.error("Error moving task:", error);
    throw error;
  }
};
