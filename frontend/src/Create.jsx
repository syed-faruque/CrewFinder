import Navbar from "./Navbar";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;

const Create = () => {
    const [info, setInfo] = useState({title: "", description: "", interests: "", tags: [], newTag: ""});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prevInfo => ({...prevInfo, [name]: value}));
    };

    const handleAddTag = () => {
        const { newTag, tags } = info;
        if (newTag && !tags.includes(newTag)) {
            setInfo(prevInfo => ({...prevInfo, tags: [...prevInfo.tags, newTag], newTag: ""}));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {title: info.title, description: info.description, interests: info.interests, tags: info.tags};
        axios.post("http://192.168.1.176:1111/createcrew", data)
            .then((response) => {
                if (response.data.success) {
                    navigate("/profile")
                } 
                else {
                    console.error("Error creating crew:", response.data.message);
                }
            })
            .catch((error) => {
                console.error("Error during the POST request:", error);
            });
    };

    return (
        <div className="create">
            <Navbar />
            <br />
            <br />
            <div className="create-contents">
                <div className = "box"></div>
                <div className="create-caption">
                    <form onSubmit={handleSubmit}>
                        <label className = "custom-label">Name Your Pirate Crew</label><br/>
                        <input className = "custom-label" name="title" value={info.title} onChange={handleChange} required /><br/>
                        <label className = "custom-label">Describe Your Pirate Crew</label><br/>
                        <textarea className = "custom-label" name="description" value={info.description} onChange={handleChange} required /><br/>
                        <label className = "custom-label">What Kinds of Pirates Are You Most Interested In?</label><br/>
                        <textarea className = "custom-label" name="interests" value={info.interests} onChange={handleChange} required /><br/>
                        <label className = "custom-label">Add Tags</label><br/>
                        <div className="tag-input">
                            <input type="text" name="newTag" value={info.newTag} onChange={handleChange} placeholder="Enter a tag" />
                            <button className = "custom-label" type="button" onClick={handleAddTag}>Add</button>
                        </div>
                        <div>
                            {info.tags.length > 0 && (
                                <p>{info.tags.join(", ")}</p>
                            )}
                        </div>
                        <input type="submit" value="Create Crew" className="create-crew-button" />
                        <br />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Create;