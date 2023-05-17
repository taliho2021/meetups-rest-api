const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs").promises;
const jwtSecret = process.env.JWT_SECRET;

exports.signup = async (req, res, next) => {
	// Your signup logic here
    const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).send("Email and password are required.");
		if (users.find((user) => user.email === email))
			return next({
				status: 409,
				message: "User with this email already exists.",
			});

		const hashedPassword = await bcrypt.hash(password, 10);

		fs.readFile("users.json", "utf8", (err, data) => {
			if (err) throw err;
			let users = JSON.parse(data || "[]");
			if (users.find((user) => user.email === email))
				return res.status(409).send("User with this email already exists.");
			const user = { email, password: hashedPassword };
			users.push(user);
			fs.writeFile("users.json", JSON.stringify(users), (err) => {
				if (err) throw err;
				res.status(201).send({ email });
			});
		});
};

exports.login = async (req, res, next) => {
	// Your login logic here
    const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).send("Email and password are required.");

		fs.readFile("users.json", "utf8", async (err, data) => {
			// <-- async keyword added here
			if (err) throw err;
			const users = JSON.parse(data || "[]");
			const user = users.find((user) => user.email === email);
			if (!user || !(await bcrypt.compare(password, user.password)))
				// <-- await keyword is now within async function
				return next({ status: 401, message: "Invalid email or password." });

			const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1h" });
			res.send({ token });
		});
};
