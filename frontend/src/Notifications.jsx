import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = () => {
        axios.get("http://192.168.1.176:1111/getnotifications")
            .then((response) => {
                const allNotifications = [
                    ...response.data.myApplications.map((application) => ({
                        message: `${application.applicant} applied to your crew: ${application.crewTitle}`,
                        applicant: application.applicant,
                        crewTitle: application.crewTitle,
                        type: 'application'
                    })),
                    ...response.data.myAcceptances.map((acceptance) => ({
                        message: `You were recruited into ${acceptance.crewTitle}. Congratulations!`,
                        crewTitle: acceptance.crewTitle,
                        crewLeader: acceptance.crewLeader,
                        type: 'acceptance'
                    })),
                ];
                setNotifications(allNotifications.reverse());
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
            });
    };

    const handleAccept = (applicant, crewTitle) => {
        axios.post("http://192.168.1.176:1111/acceptapplicant", {
            applicant,
            crewName: crewTitle
        })
        .then(() => {
            fetchNotifications(); // Refresh the notifications after accepting
        })
        .catch((error) => {
            console.error("Error accepting applicant:", error);
        });
    };

    const handleReject = (applicant, crewTitle) => {
        axios.post("http://192.168.1.176:1111/rejectapplicant", {
            applicant,
            crewName: crewTitle
        })
        .then(() => {
            fetchNotifications(); // Refresh the notifications after rejecting
        })
        .catch((error) => {
            console.error("Error rejecting applicant:", error);
        });
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="notifications-container">
            <Navbar />
            <div className="notifications">
                <h2 className="notifications-heading">Notifications</h2>
                <div className="notifications-list">
                    {notifications.map((notification, index) => (
                        <div className="notification" key={index}>
                            <p>{notification.message}</p>
                            {notification.type === 'application' && (
                                <div className="application-actions">
                                    <button 
                                        onClick={() => window.location.href = `/${notification.applicant}`}>
                                        View Applicant Profile
                                    </button>
                                    <button 
                                        onClick={() => handleAccept(notification.applicant, notification.crewTitle)}>
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleReject(notification.applicant, notification.crewTitle)}>
                                        Reject
                                    </button>
                                </div>
                            )}
                            {notification.type === 'acceptance' && (
                                <button onClick={() => window.location.href = `/${notification.crewLeader}/${notification.crewTitle}`}>
                                    View Crew Page
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
