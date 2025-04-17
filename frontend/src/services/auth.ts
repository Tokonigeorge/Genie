import { api } from './api';

interface SignupResponse {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
  has_existing_org: boolean;
  domain: string;
}

// interface OrganizationCreate {
//   name: string;
//   domain: string;
//   workspace_url: string;
// }

export const authApi = {
  signup: async (email: string, password: string) => {
    const response = await api.post<SignupResponse>('/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  createOrganization: async (formData: FormData) => {
    const response = await api.post('/auth/create-organization', formData);
    return response.data;
  },

  requestAccess: async (orgId: string) => {
    const response = await api.post(`/auth/request-access/${orgId}`);
    return response.data;
  },
};
