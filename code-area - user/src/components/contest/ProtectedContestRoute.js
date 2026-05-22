import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProtectedContestRoute = ({ children }) => {
    const { id } = useParams();
    const token = localStorage.getItem('auth-token');
    const username = localStorage.getItem('username');
    const [status, setStatus] = useState('loading');

    const checkAccess = async () => {
        if (!token || !username) {
            setStatus('notfound');
            return;
        }
        try {
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
            const res = await fetch(`${BACKEND_URL}/user/check-contest-access/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({ username })
            });

            const json = await res.json();
            setStatus(json.allowed ? 'allowed' : 'notfound');
        } catch (error) {
            console.error('Error checking access:', error);
            setStatus('notfound');
        }
    };

    useEffect(() => {
        checkAccess();
    }, [id]);

    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'notfound') return <h1>404 Not Found</h1>;

    return children;
};

export default ProtectedContestRoute;
