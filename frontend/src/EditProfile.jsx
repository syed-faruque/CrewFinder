import { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const EditProfile = ({ location, contacts, description, skills, setLocation, setContacts, setDescription, setSkills, handleCloseModal }) => {
    const [updatedLocation, setUpdatedLocation] = useState(location);
    const [updatedContacts, setUpdatedContacts] = useState(contacts);
    const [updatedDescription, setUpdatedDescription] = useState(description);
    const [updatedSkills, setUpdatedSkills] = useState(skills ? skills.split(", ") : []);
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = () => {
        if (newSkill && !updatedSkills.includes(newSkill)) {
            setUpdatedSkills([...updatedSkills, newSkill]);
            setNewSkill("");
        }
    };

    const handleSave = () => {
        axios.post("http://192.168.1.176:1111/editprofile", {
            location: updatedLocation,
            contacts: updatedContacts,
            description: updatedDescription,
            skills: updatedSkills.join(", ")
        })
        .then(() => {
            setLocation(updatedLocation);
            setContacts(updatedContacts);
            setDescription(updatedDescription);
            setSkills(updatedSkills.join(", "));
            handleCloseModal();
        })
        .catch(error => console.error("Error updating data:", error));
    };

    return (
        <div className="edit-profile-modal">
            <div className="modal-content">
                <h3>Edit Profile</h3>
                <form>
                    <div className="modal-input">
                        <label>Location:</label>
                        <input type="text" value={updatedLocation} onChange={(e) => setUpdatedLocation(e.target.value)} />
                    </div>
                    <div className="modal-input">
                        <label>Contacts:</label>
                        <input type="text" value={updatedContacts} onChange={(e) => setUpdatedContacts(e.target.value)} />
                    </div>
                    <div className="modal-input">
                        <label>Description:</label>
                        <input type="text" value={updatedDescription} onChange={(e) => setUpdatedDescription(e.target.value)} />
                    </div>
                    <div className="modal-input">
                        <label>Skills:</label>
                        <div className="skills-input">
                            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Enter a skill" />
                            <button type="button" onClick={handleAddSkill}>Add</button>
                        </div>
                        <div>
                            {updatedSkills.length > 0 && <p>{updatedSkills.join(", ")}</p>}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleSave}>Save</button>
                        <button type="button" onClick={handleCloseModal}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;
