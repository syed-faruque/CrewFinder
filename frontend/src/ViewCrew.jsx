import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import axios from 'axios';

const ViewCrew = () => {
    const { crew, leader } = useParams();
    const [crewmates, setCrewmates] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    const fetchData = (leader, crew) => {
        axios.post("http://192.168.1.176:1111/getcrewinfo", { leader: leader, crew: crew })
            .then((response) => {
                setCrewmates(response.data.crewmates);
            })
            .catch((error) => {
                console.error("Error fetching crew data:", error);
            });
    };

    useEffect(() => {
        fetchData(leader, crew);
    }, [leader, crew]);

    const handleViewProfile = (crewmateName) => {
        navigate(`../${crewmateName}`);
    };

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-info">
                <div className="group-leader">
                    <h2>{leader} is the Group Captain</h2>
                    <button className="view-profile-button" onClick={() => handleViewProfile(leader)}>View Profile</button>
                </div>
                <div className="crewmates">
                    <h3>Pirates of This Crew</h3>
                    {crewmates.length > 0 ? (
                        crewmates.map((crewmate, index) => (
                            <div className="crew-item" key={index}>
                                <span>{crewmate}</span>
                                <button className="view-profile-button" onClick={() => handleViewProfile(crewmate)}>
                                    View Profile
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No crewmates found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCrew;
