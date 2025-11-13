import { createContext, useContext, useEffect, useState } from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import { authAPI, profileAPI } from "../services/api";

interface AuthContextType {
    user: User | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const userData = await profileAPI.getCurrentUser();
            setUser(userData);
        } catch(error) {
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: LoginRequest) => {
        const response = await authAPI.login(data);
        localStorage.setItem("token", response.token);
        await fetchCurrentUser();
    };

    const register = async (data: RegisterRequest) => {
        await authAPI.register(data);
        await login({ email: data.email, password: data.password });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};