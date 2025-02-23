import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import "./Styles.css";
import crewLogo from './assets/Crew.png';
axios.defaults.withCredentials = true;

const Navbar = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".navsearchresults")){
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        setSearch(value);
        axios.post("http://192.168.1.176:1111/searchusers", { search: value })
            .then((response) => {
                setSearchResults(response.data);
                console.log(searchResults);
            })
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            axios.post("http://192.168.1.176:1111/searchusers", { search: search })
            .then((response) => {
                if (response.data) {
                    if (window.location.pathname === '/search') {
                        window.location.reload();
                    } 
                    else {
                        navigate("/search");
                    }
                }
            })
        }
    };

    const handleResultsClick = (index) => {
        const result = searchResults[index];
        if (result.type === 'user') {
            navigate(`/${result.name}`);
        } 
        else if (result.type === 'crew') {
            navigate(`/${result.captain}/${result.name}`);
        }
        setSearchResults([]);
    }

    const handleBarClick = (event) => {
        handleChange(event);
    }

    return (
        <div className="navbar">
            <img src={crewLogo} alt="Crew Logo" className="crew-logos" />
            <span className="finder-texter">Finder</span>
            <div className='searchfeatures'>
                <input placeholder="Search" value={search} onClick={handleBarClick} onChange={handleChange} onKeyPress={handleKeyPress} type="search"/>
                <div className="navsearchresults">
                    {searchResults.map((result, index) => (
                        <div 
                            className={`results`} 
                            key={index} 
                            onClick={() => handleResultsClick(index)}
                        >
                            {result.name} 
                            <span className="type-indicator">{result.type === 'user' ? '(User)' : '(Crew)'}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Link to="/create"><button name="Make a Crew">Make a Crew</button></Link>
            <Link to="/home"><button name="Find Crews">Find Crews</button></Link>
            <Link to="/profile"><button name="Pirate Profile">Pirate Profile</button></Link>
            <Link to="/notifications"><button name="Notifications">Notifications</button></Link>
            <Link to="/"><button name="logout">Logout</button></Link>
        </div>
    )
}

export default Navbar;
