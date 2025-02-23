import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

axios.defaults.withCredentials = true;

const Home = () => {
    const navigate = useNavigate();
    const [crewpostings, setCrewPostings] = useState([]);
    const [loading, setLoading] = useState(true);

    const getFeeds = () => {
        axios.get("http://192.168.1.176:1111/getcrewpostings")
            .then((response) => {
                setCrewPostings(response.data.reverse());
            })
            .catch(error => console.error("Error fetching info:", error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getFeeds();
    }, []);

    // Sync the applied posts with localStorage on initial render
    useEffect(() => {
        const storedAppliedPosts = JSON.parse(localStorage.getItem("appliedPosts")) || [];
        setCrewPostings(prevPostings =>
            prevPostings.map(post => ({
                ...post,
                isApplied: storedAppliedPosts.includes(post.title),
            }))
        );
    }, []);

    const handleApply = (crew, leader) => {
        // Optimistically disable the button and update the UI immediately
        setCrewPostings(prevPostings =>
            prevPostings.map(post =>
                post.title === crew ? { ...post, isApplied: true } : post
            )
        );

        // Call the backend to apply to the crew
        axios.post("http://192.168.1.176:1111/applytocrew", { crew, leader })
            .then(() => {
                // On success, save the applied post to localStorage
                const storedAppliedPosts = JSON.parse(localStorage.getItem("appliedPosts")) || [];
                localStorage.setItem("appliedPosts", JSON.stringify([...storedAppliedPosts, crew]));
            })
            .catch(error => {
                console.error("Error applying:", error);
                // If the API call fails, revert the UI state change
                setCrewPostings(prevPostings =>
                    prevPostings.map(post =>
                        post.title === crew ? { ...post, isApplied: false } : post
                    )
                );
            });
    };

    return (
        <div className="home">
            <Navbar />
            <br />
            <br />

            {loading ? (
                <div className="loading-spinner">
                    {/* You can replace this with a more complex spinner if needed */}
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="feed-container">
                    {crewpostings.length > 0 ? (
                        crewpostings.map((post, index) => (
                            <div key={index} className="crew-posting">
                                <h3>{post.title}</h3>
                                <p><strong>Captain:</strong> {post.captain}</p>
                                <p><strong>Description:</strong> {post.description}</p>
                                <p><strong>Interests:</strong> {post.interests}</p>
                                <p><strong>Tags:</strong> {post.tags}</p>
                                <button
                                    className="apply-button"
                                    onClick={() => handleApply(post.title, post.captain)}
                                    disabled={post.isApplied}
                                >
                                    {post.isApplied ? "Applied" : "Apply"}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No crew postings available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
