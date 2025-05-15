import api from './api';



interface User {
    email: string;
    mdp: string;
    role: string;
    nom:string;
}

interface LoginResponse {
    token: string;
    id: string;
    role: string;
    user_info: any;
    email: string;
    nom:string;
}

export const AuthService = {
    login: async (user: User): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/utilisateur/login/', user);
        localStorage.setItem('token', response.data.token);
        return response.data.user_info;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): { id: string | null; role: string | null } => {
        const token = localStorage.getItem('token');
        if (!token) return { id: null, role: null };


        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: payload.id, role: payload.role };
    },
};