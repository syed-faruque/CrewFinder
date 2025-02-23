import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import EditProfile from "./EditProfile";
import { useNavigate } from "react-router-dom"; // Import useNavigate

axios.defaults.withCredentials = true;

const Profile = () => {
    const [username, setUsername] = useState('');
    const [location, setLocation] = useState('');
    const [contacts, setContacts] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [leadingCrews, setLeadingCrews] = useState([]);
    const [nonLeadingCrews, setNonLeadingCrews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); // Initialize navigate

    const fetchData = () => {
        axios.get("http://192.168.1.176:1111/getinfo")
            .then((response) => {
                setUsername(response.data.userInfo.username);
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
        fetchData();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCloseModal = () => {
        setIsEditing(false);
    };

    const handleViewCrew = (captain, title) => {
        // Navigate to the crew page with both captain (username) and title
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
                                <h3>Crews You Are Captain Of</h3>
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
                                <h3>Crews You Are A Member Of</h3>
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
                    <button className="edit-button" onClick={handleEditClick}>
                        Edit Profile
                    </button>
                </div>
            )}

            {isEditing && (
                <EditProfile 
                    location={location} 
                    contacts={contacts} 
                    description={description} 
                    skills={skills}
                    setLocation={setLocation} 
                    setContacts={setContacts} 
                    setDescription={setDescription} 
                    setSkills={setSkills}
                    handleCloseModal={handleCloseModal}
                />
            )}
        </div>
    );
}

export default Profile;
