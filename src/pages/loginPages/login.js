import React, { useEffect } from 'react';
import axios from 'axios';
const APIURL = `https://master.d18slmijdq6uhn.amplifyapp.com/`



function Login() {
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            try {
                const response = await axios.get(`${APIURL}/protected-resource`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <h1>Home</h1>
            <p>Protected content will be fetched and displayed here.</p>
        </>
    );
}

export default Login;
