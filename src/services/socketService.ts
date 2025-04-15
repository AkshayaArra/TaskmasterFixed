
import io, { Socket } from "socket.io-client";
import { Task } from "./taskService";

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem("taskmaster-token");
    
    if (!token) {
      throw new Error("Authentication required");
    }
    
    socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: {
        token
      }
    });
    
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });
    
    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });
    
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToTasks = (callback: (data: { task: Task, action: string }) => void): void => {
  const socket = initializeSocket();
  socket.on("taskUpdate", callback);
};

export const subscribeToUserActivity = (callback: (data: { username: string, action: string }) => void): void => {
  const socket = initializeSocket();
  socket.on("userActivity", callback);
};

export const emitTaskCreated = (task: Task): void => {
  const socket = initializeSocket();
  socket.emit("createTask", { task });
};

export const emitTaskUpdated = (task: Task): void => {
  const socket = initializeSocket();
  socket.emit("updateTask", { task });
};

export const emitTaskDeleted = (taskId: string): void => {
  const socket = initializeSocket();
  socket.emit("deleteTask", { taskId });
};

export const emitTaskMoved = (
  taskId: string,
  sourceColumn: string,
  destinationColumn: string,
  newIndex: number
): void => {
  const socket = initializeSocket();
  socket.emit("moveTask", {
    taskId,
    sourceColumn,
    destinationColumn,
    newIndex
  });
};
