const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../templates'); 
const publicPath = path.join(__dirname, '../public');
console.log(publicPath);

app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/signup', async (req, res) => {
    const { name, password } = req.body; // Destructure for cleaner access

    try {
        const existingUser = await LogInCollection.findOne({ name });

        if (existingUser) {
            // If user exists, check the password (note: should use hashed passwords in production)
            return res.send("User details already exist");
        }

        // If no user found, create new user
        await LogInCollection.create({ name, password }); // Create method is more concise
        return res.status(201).render("home", { naming: name });
    } catch (error) {
        console.error("Signup Error:", error);
        return res.send("An error occurred during signup");
    }
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await LogInCollection.findOne({ name });

        if (!user) {
            return res.send("User not found");
        }

        if (user.password !== password) {
            // In a real-world scenario, use bcrypt.compare for hashed passwords
            return res.send("Incorrect password");
        }

        return res.status(200).render("home", { naming: name });
    } catch (error) {
        console.error("Login Error:", error);
        return res.send("An error occurred during login");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});