import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Styles.css";
import footerImage from './assets/New_Project.png';
import crewLogo from './assets/Crew.png';
axios.defaults.withCredentials = true;

const Login = () => {
    const [info, setInfo] = useState({ email: "", password: "" });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInfo(prevInfo => ({ ...prevInfo, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post("http://192.168.1.176:1111/login", info)
            .then((response) => {
                if (response.data.valid) {
                    navigate("/home");
                } else {
                    setError("Combo doesn't exist");
                }
            })
            .catch(error => console.error("Error fetching info:", error));
    };

    return (
        <div className='login'>
            <div className="login-box">
                <img src={footerImage} alt="Footer" className="footer-image" />
                <div className='loginmessage'>
                    <h1>
                        <img src={crewLogo} alt="Crew Logo" className="crew-logo" />
                        <span className="finder-text">Finder</span>
                    </h1>
                </div>
                <div className='loginform'>
                    <form onSubmit={handleSubmit}>
                        <input type='email' placeholder='Email' name='email' value={info.email} onChange={handleChange} className="login-butto" /><br />
                        <input type='password' placeholder='Password' name='password' value={info.password} onChange={handleChange} className="login-butto" /><br />
                        <input type="submit" value="LOGIN" className="login-butto" />
                        <Link to="/signup" className="login-butto">Create new account</Link><br />
                        <label>{error}</label>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
