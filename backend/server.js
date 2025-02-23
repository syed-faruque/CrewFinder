//backend API code

//library imports
const express = require("express")
const cors = require("cors")
const session = require("express-session")
const sql = require("mysql2");
const multer = require("multer");
const uuid = require('uuid').v4;
const app = express();

//middleware
app.use(cors({ origin: ["http://192.168.1.176:5173"], methods: ["POST", "GET"], credentials: true }))
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }))
app.use(express.json())
app.use(express.static("assets"));

//allows uploaded files to be stored in assets folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) { return cb(null, "assets") },
    filename: function (req, file, cb) { return cb(null, file.originalname) }
})
const upload = multer({ storage })

//database connection
const connection = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "storage"
})

//creates necessary tables
connection.query(`
    CREATE TABLE IF NOT EXISTS accounts (
        username VARCHAR(255),
        password VARCHAR(255),
        email VARCHAR(255),
        location VARCHAR(255),
        contacts VARCHAR(255),
        description TEXT,
        crews VARCHAR(255),
        leading_crews VARCHAR(255),
        skills VARCHAR(255)
    );
`);
connection.query(`
     CREATE TABLE IF NOT EXISTS crews (
        captain VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        interests TEXT,
        tags VARCHAR(255),
        pirates VARCHAR(255)
     );
`);


connection.query(`
        CREATE TABLE IF NOT EXISTS acceptances (
           users VARCHAR(255),
           captains VARCHAR(255),
           crews VARCHAR(255)
        );
`);

connection.query(`
        CREATE TABLE IF NOT EXISTS applications (
            leaders VARCHAR(255),
            applicants VARCHAR(255),
            crews VARCHAR(255)
        );
    `);


//endpoint for storing credentials in database
app.post('/signup', (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    connection.query("SELECT * FROM accounts WHERE email = ? OR username = ?", [email, username], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length > 0) {
            res.json({ valid: false });
        }
        else {
            connection.query("INSERT INTO accounts (email, username, password) VALUES (?, ?, ?)", [email, username, password], (err) => {
                if (err) {
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ valid: true });
            });
        }
    });
});

//endpoint for checking if credentials exist in database
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    connection.query("SELECT * FROM accounts WHERE email = ? AND password = ?", [email, password], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (results.length > 0) {
            req.session.email = email;
            req.session.username = results[0].username;
            res.json({ valid: true });
        }
        else {
            res.json({ valid: false });
        }
    });
});


//endpoint for creating a crew
app.post('/createcrew', (req, res) => {
    const username = req.session.username;
    const { title, description, interests, tags } = req.body;
    const tagsString = tags.join(' ');
    connection.query("INSERT INTO crews (captain, title, description, interests, tags) VALUES (?,?,?,?,?)",
        [username, title, description, interests, tagsString], (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ success: true });
        });
});


//endpoint for applying to a crew
app.post("/applytocrew", (req, res) => {
    const username = req.session.username;
    const leader = req.body.leader;
    const crew = req.body.crew;
    console.log(username);
    console.log(leader);
    console.log(crew);
    connection.query("INSERT INTO applications (leaders, applicants, crews) VALUES (?,?,?)", [leader, username, crew], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
})

app.post("/acceptapplicant", (req, res) => {
    const username = req.session.username;
    const applicant = req.body.applicant;
    const crewName = req.body.crewName;
    console.log(applicant);
    console.log(crewName);
    
    connection.query(`
            UPDATE crews 
            SET pirates = 
                CASE 
                    WHEN pirates IS NULL OR pirates = '' THEN ?
                    ELSE CONCAT(pirates, ',', ?) 
                END
            WHERE captain = ? AND title = ?`,
        [applicant, applicant, username, crewName],
        (error, result) => {
            if (error) {
                console.error("Error updating crew:", error);
                return res.status(500).send("Error accepting applicant to crew.");
            }
            connection.query(`
                    DELETE FROM applications 
                    WHERE leaders = ? AND applicants = ? AND crews = ?`,
                [username, applicant, crewName],
                (error, result) => {
                    if (error) {
                        console.error("Error deleting application:", error);
                        return res.status(500).send("Error removing application.");
                    }
                    connection.query(`
                            INSERT INTO acceptances (users, crews, captains)
                            VALUES (?, ?, ?)`,
                        [applicant, crewName, username],
                        (error, result) => {
                            if (error) {
                                console.error("Error inserting into acceptances:", error);
                                return res.status(500).send("Error recording acceptance.");
                            }

                            res.status(200).send("Applicant accepted successfully.");
                        }
                    );
                }
            );
        }
    );
});



app.post("/rejectapplicant", (req, res) => {
    const username = req.session.username;
    const applicant = req.body.applicant;
    const crewName = req.body.crewName;
    console.log(applicant);
    connection.query(`
            DELETE FROM applications 
            WHERE leaders = ? AND applicants = ? AND crews = ?`,
        [username, applicant, crewName],
        (err, result) => {
            if (err) {
                console.error("Error deleting application:", err);
                return res.status(500).send("Error rejecting applicant.");
            }

            res.status(200).send("Applicant rejected successfully.");
        }
    );
});


//endpoint to update information related to a user
app.post('/editprofile', (req, res) => {
    const username = req.session.username;
    const { location, contacts, description, skills } = req.body;

    connection.query(`UPDATE accounts SET location = ?, contacts = ?, description = ?, skills = ? WHERE username = ?`, [location, contacts, description, skills, username], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error updating profile", error });
        }
        return res.status(200).json({ message: "Profile updated successfully" });
    }
    );
});

app.get('/getcrewpostings', (req, res) => {
    let feed = [];
    const username = req.session.username;

    const query = `
        SELECT 
            crews.captain, 
            crews.title, 
            crews.description, 
            crews.interests, 
            crews.tags,
            crews.pirates, 
            IF(applications.applicants IS NOT NULL, 1, 0) AS isApplied
        FROM crews
        LEFT JOIN applications ON crews.title = applications.crews AND applications.applicants = ?
    `;

    connection.query(query, [username], (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results) {
            feed = results
                .filter(post => {
                    const piratesArray = post.pirates ? post.pirates.split(',').map(pirate => pirate.trim()) : [];
                    return !piratesArray.includes(username);
                })
                .map(post => ({
                    captain: post.captain,
                    title: post.title,
                    description: post.description,
                    interests: post.interests,
                    tags: post.tags,
                    isApplied: post.isApplied === 1
                }));
        }

        res.json(feed);
    });
});







app.get('/getinfo', (req, res) => {
    const username = req.session.username;
    console.log(username);

    connection.query("SELECT * FROM accounts WHERE username = ?", [username], (error, results) => {
        if (error) {
            console.log("error");
            return res.status(500).json({ error: 'Error retrieving user info' });
        }

        connection.query("SELECT * FROM crews WHERE captain = ?", [username], (captainError, captainResults) => {
            if (captainError) {
                console.log("Error retrieving captain's crews");
                return res.status(500).json({ error: 'Error retrieving captain\'s crews' });
            }

            connection.query(`
                    SELECT c.* FROM crews c
                    JOIN acceptances a ON c.title = a.crews
                    WHERE a.users = ?`, [username], (acceptanceError, acceptedResults) => {
                if (acceptanceError) {
                    console.log("Error retrieving accepted crews");
                    return res.status(500).json({ error: 'Error retrieving accepted crews' });
                }
                res.json({
                    userInfo: results[0],
                    captainCrews: captainResults,
                    acceptedCrews: acceptedResults
                });
            });
        });
    });
});


//endpoint to receive the current user's data
app.post("/getuserdata", (req, res) => {
    const username = req.body.username;

    connection.query("SELECT * FROM accounts WHERE username = ?", [username], (error, results) => {
        if (error) {
            console.log("error");
            return res.status(500).json({ error: 'Error retrieving user info' });
        }

        connection.query("SELECT * FROM crews WHERE captain = ?", [username], (captainError, captainResults) => {
            if (captainError) {
                console.log("Error retrieving captain's crews");
                return res.status(500).json({ error: 'Error retrieving captain\'s crews' });
            }

            connection.query(`
                    SELECT c.* FROM crews c
                    JOIN acceptances a ON c.title = a.crews
                    WHERE a.users = ?`, [username], (acceptanceError, acceptedResults) => {
                if (acceptanceError) {
                    console.log("Error retrieving accepted crews");
                    return res.status(500).json({ error: 'Error retrieving accepted crews' });
                }
                res.json({
                    userInfo: results[0],
                    captainCrews: captainResults,
                    acceptedCrews: acceptedResults
                });
            });
        });
    });
})

app.post("/getcrewinfo", (req, res) => {
    const leader = req.body.leader;
    const crew = req.body.crew;
    connection.query("SELECT * FROM crews WHERE captain = ? and title = ?", [leader, crew], (error, response) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        
        if (response.length > 0) {
            const crewmates = response[0].pirates;
            
            // Check if the crewmates string is not empty or undefined
            if (crewmates && crewmates.trim() !== "") {
                const crewmatesArray = crewmates.split(', '); 
                res.json({ crewmates: crewmatesArray });
            } else {
                res.json({ crewmates: [] }); // Return an empty array if no crewmates exist
            }
        } else {
            res.json({ crewmates: [] }); // Handle case if no crew info is found
        }
    });
});



app.get("/getnotifications", (req, res) => {
    const user = req.session.username;
    connection.query("SELECT crews, applicants FROM applications WHERE leaders = ?", [user], (error, applicationResults) => {
        if (error) {
            console.error("Error fetching applications:", error);
            return res.status(500).send("Error fetching application notifications.");
        }
        connection.query("SELECT crews, captains FROM acceptances WHERE users = ?", [user], (error, acceptanceResults) => {
            if (error) {
                console.error("Error fetching acceptances:", error);
                return res.status(500).send("Error fetching acceptance notifications.");
            }
            const notifications = {
                myApplications: applicationResults.map(application => ({ crewTitle: application.crews, applicant: application.applicants })),
                myAcceptances: acceptanceResults.map(acceptance => ({ crewTitle: acceptance.crews, crewLeader: acceptance.captains})),
            };

            res.status(200).json(notifications);
        });
    });
});


//endpoint to update session variables related to a user's search
app.post("/searchusers", (req, res) => {
    const search = req.body.search + "%";
    const userQuery = "SELECT username FROM accounts WHERE username LIKE ?";
    const crewQuery = "SELECT title, captain FROM crews WHERE title LIKE ?";
    connection.query(userQuery, [search], (error, userResults) => {
        if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(crewQuery, [search], (error, crewResults) => {
            if (error) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const searchResults = [
                ...userResults.map(user => ({ name: user.username, type: 'user' })),
                ...crewResults.map(crew => ({ name: crew.title, captain: crew.captain, type: 'crew' }))
            ];
            req.session.searchresults = searchResults;
            res.json(req.session.searchresults);
        });
    });
});



//endpoint to receive a specific user's data
app.post("/viewprofile", (req, res) => {
    const username = req.body.username;
    connection.query("SELECT * FROM user_posts WHERE users = ?", [username], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
        const user_posts = results.map(post => [post.files, post.post_ids]);
        res.json({ user: username, posts: user_posts });
    })
})

//endpoint to receive search results
app.get("/getsearchresults", (req, res) => {
    res.json(req.session.searchresults);
})

//allows server to listen on port 1111 on local network ip
app.listen(1111, "0.0.0.0", () => {
    console.log("Running.......")
});
