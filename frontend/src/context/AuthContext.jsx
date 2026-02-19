import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, demoLogin } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const loginDemo = async (email = 'demo@example.com', displayName = 'Demo User') => {
        const res = await demoLogin(email, displayName);
        localStorage.setItem('token', res.data.access_token);
        setUser(res.data.user);
        return res.data.user;
    };

    const loginWithToken = async (token) => {
        localStorage.setItem('token', token);
        const res = await getMe();
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginDemo, loginWithToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
