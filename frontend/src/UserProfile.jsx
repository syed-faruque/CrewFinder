import { useParams, useNavigate} from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const UserProfile = () => {
    const {username} = useParams();
    const [location, setLocation] = useState('');
    const [contacts, setContacts] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [leadingCrews, setLeadingCrews] = useState([]);
    const [nonLeadingCrews, setNonLeadingCrews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = (username) => {
        axios.post("http://192.168.1.176:1111/getuserdata", {username: username})
            .then((response) => {
                setLocation(response.data.userInfo.location || '');
                setContacts(response.data.userInfo.contacts || '');
                setDescription(response.data.userInfo.description || '');
                setSkills(response.data.userInfo.skills || '');
                setLeadingCrews(response.data.captainCrews || []);
                setNonLeadingCrews(response.data.acceptedCrews || []);
            })
            .catch(error => console.error("Error fetching data:", error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(username);
    }, [username]);


    const handleViewCrew = (captain, title) => {
        navigate(`/${captain}/${title}`);
    };

    return (
        <div className="profile-container">
            <Navbar />
            {!loading && (
                <div className="profile-info">
                    <h2>{username}'s Profile</h2>
                    <div className="profile-details">
                        <div className="info-row">
                            <strong>Location:</strong> {location || 'No location given'}
                        </div>
                        <div className="info-row">
                            <strong>Contacts:</strong> {contacts || 'No contact info given'}
                        </div>
                        <div className="info-row">
                            <strong>Description:</strong> {description || 'No description given'}
                        </div>
                        <div className="info-row">
                            <strong>Skills:</strong> {skills || 'No skills listed'}
                        </div>
                        
                        <div className="crews">
                            <div className="leading">
                                <h3>{username} Is A Captain Of The Following Crews</h3>
                                {leadingCrews.length > 0 ? (
                                    leadingCrews.map((crew, index) => (
                                        <div key={index} className="crew-item">
                                            <strong>{crew.title}</strong>
                                            <button onClick={() => handleViewCrew(crew.captain, crew.title)}>
                                                View Crew
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No leading crews</p>
                                )}
                            </div>

                            <div className="nonleading">
                                <h3>{username} Is A Member Of The Following Crews</h3>
                                {nonLeadingCrews.length > 0 ? (
                                    nonLeadingCrews.map((crew, index) => (
                                        <div key={index} className="crew-item">
                                            <strong>{crew.title}</strong>
                                            <button onClick={() => handleViewCrew(crew.captain, crew.title)}>
                                                View Crew
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No accepted crews</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}          
        </div>
    );
};

export default UserProfile;