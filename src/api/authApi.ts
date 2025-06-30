import API from './axiosConfig';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
  role: string;
}

interface RegisterUserData {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
}

interface RegisterAccountData {
  username: string;
  name: string;
  password: string;
  role: string;
  permissions: {
    can_register_faces: boolean;
    can_view_recognition: boolean;
    can_view_logs: boolean;
    can_manage_users: boolean;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterUserData): Promise<{ success: boolean; message: string }> => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const checkAuth = async (): Promise<{ authenticated: boolean }> => {
  const response = await API.get('/auth/check');
  return response.data;
};

export const registerAccount = (accountData: RegisterAccountData) => {
  return API.post('/register_account', accountData)
    .then(response => response.data);
};

export const getAllAccounts = () => {
  return API.get('/accounts')
    .then(response => response.data);
};

export const deleteAccount = (accountId: number) => {
  return API.delete(`/account/${accountId}`)
    .then(response => response.data);
}; 