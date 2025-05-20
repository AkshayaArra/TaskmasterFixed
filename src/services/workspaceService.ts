import api from '@/lib/api';

export interface Workspace {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
    role: 'owner' | 'admin' | 'member';
  }>;
  createdAt: string;
}

// Helper function to transform MongoDB document to Workspace
const transformWorkspace = (doc: any): Workspace => ({
  id: doc._id,
  name: doc.name,
  owner: {
    id: doc.owner._id,
    name: doc.owner.name,
    email: doc.owner.email
  },
  members: doc.members.map((member: any) => ({
    user: {
      id: member.user._id,
      name: member.user.name,
      email: member.user.email
    },
    role: member.role
  })),
  createdAt: doc.createdAt
});

// Fetch all workspaces for the current user
export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await api.get('/workspaces');
    return response.data.map(transformWorkspace);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name: string): Promise<Workspace> => {
  try {
    const response = await api.post('/workspaces', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
};

// Update a workspace
export const updateWorkspace = async (id: string, name: string): Promise<Workspace> => {
  try {
    const response = await api.put(`/workspaces/${id}`, { name });
    return response.data;
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};

// Delete a workspace
export const deleteWorkspace = async (id: string): Promise<void> => {
  try {
    await api.delete(`/workspaces/${id}`);
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

// Add a member to a workspace
export const addWorkspaceMember = async (
  workspaceId: string,
  email: string,
  role: 'admin' | 'member' = 'member'
): Promise<Workspace> => {
  try {
    const response = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
    return response.data;
  } catch (error) {
    console.error('Error adding workspace member:', error);
    throw error;
  }
};

// Remove a member from a workspace
export const removeWorkspaceMember = async (workspaceId: string, userId: string): Promise<Workspace> => {
  try {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing workspace member:', error);
    throw error;
  }
};