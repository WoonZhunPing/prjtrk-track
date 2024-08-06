import axios from "@/api/axios";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

function Logout() {
    const navigate = useNavigate();

    localStorage.clear();

    useEffect(() => {
        axios.get('/logout')
            .then(() => {
                location.reload();
            })
            .catch(err => console.log(err));

        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == false) {
                    navigate('/login');
                }
            })
    }, []);

    return (
        <>
            {/* Empty Page */}
            {/* Solely for Logout */}
        </>
    );
}

export default Logout;