import { api } from './api';

// interface SignupResponse {
//   user: {
//     id: string;
//     email: string;
//     full_name: string | null;
//   };
//   has_existing_org: boolean;
//   domain: string;
// }

interface SignupResponse {
  id: string;
  email: string;
  full_name: string | null;
  has_existing_org: boolean;
  domain: string;
  organization_status: 'invited' | 'active' | null; // Match MemberStatus enum
}

export interface OnboardingStatusResponse {
  user_id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  membership_status: 'invited' | 'active' | null; // Match MemberStatus enum
  membership_role: 'member' | 'admin' | null; // Match MemberRole enum
  organization_id: string | null;
  organization_name: string | null;
  organization_domain: string | null;
}

// interface OrganizationCreate {
//   name: string;
//   domain: string;
//   workspace_url: string;
// }

export const authApi = {
  signup: async (
    email: string,
    full_name: string | null,
    supabase_user_id: string
  ) => {
    try {
      const response = await api.post<SignupResponse>('/auth/register', {
        email,
        full_name,
        supabase_user_id,
      });
      return response.data;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Registration failed';
      throw new Error(detail);
    }
  },
  sendVerification: async (email: string) => {
    try {
      const response = await api.post('/auth/send-verification', { email });
      return response.data; // Should return { message: "..." }
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to send verification email';
      throw new Error(detail);
    }
  },
  getOnboardingStatus: async (): Promise<OnboardingStatusResponse> => {
    try {
      const response = await api.get<OnboardingStatusResponse>(
        '/auth/onboarding-status'
      );
      return response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to fetch onboarding status';
      throw new Error(detail);
    }
  },
  updateUser: async (userData: { first_name?: string; last_name?: string }) => {
    try {
      const response = await api.patch('/users/me', userData); // Use PATCH
      return response.data; // Returns UserResponse structure
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Failed to update user';
      throw new Error(detail);
    }
  },

  createOrganization: async (formData: FormData) => {
    try {
      const response = await api.post('/auth/create-organization', formData);
      return response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to create organization';
      throw new Error(detail);
    }
  },
  requestAccess: async (orgId: string) => {
    // ... unchanged ...
    try {
      const response = await api.post(`/auth/request-access/${orgId}`); // Ensure backend route exists
      return response.data;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Failed to request access';
      throw new Error(detail);
    }
  },
};
