const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();

app.use(express.json());

const jwtSecret = "your_jwt_secret";

const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(" ")[1];
		jwt.verify(token, jwtSecret, (err, user) => {
			if (err) return next({ status: 403, message: "Forbidden." });
			req.user = user;
			next();
		});
	} else {
		next({ status: 401, message: "Unauthorized." });
	}
};

app.post("/signup", async (req, res) => {
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
});

app.post("/login", async (req, res, next) => {
	// <-- async keyword added here
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
});

app.post("/meetups", authenticateJWT, (req, res) => {
	const { title, summary, address, date } = req.body;
	if (!title || !summary || !address)
		return res
			.status(400)
			.send("Title, summary and address must be non-empty strings.");

	const parsedDate = new Date(date);
	if (isNaN(parsedDate.getTime())) return res.status(400).send("Invalid date.");

	fs.readFile("meetups.json", "utf8", (err, data) => {
		if (err) throw err;
		let meetups = JSON.parse(data || "[]");
		const meetup = {
			id: meetups.length + 1,
			title: req.body.title,
			summary: req.body.summary,
			address: req.body.address,
			date: date.toISOString(),
		};
		meetups.push(meetup);
		fs.writeFile("meetups.json", JSON.stringify(meetups), (err) => {
			if (err) throw err;
			res.status(201).send(meetup);
		});
	});
});

app.get("/meetups", (req, res) => {
	fs.readFile("meetups.json", "utf8", (err, data) => {
		if (err) throw err;
		res.send(JSON.parse(data || "[]"));
	});
});

app.patch("/meetups/:id", authenticateJWT, (req, res) => {
	const { title, summary, address, date } = req.body;
	if (
		(title && !title.trim()) ||
		(summary && !summary.trim()) ||
		(address && !address.trim())
	)
		return res
			.status(400)
			.send("Title, summary and address must be non-empty strings.");

	if (date) {
		const parsedDate = new Date(date);
		if (isNaN(parsedDate.getTime()))
			return res.status(400).send("Invalid date.");
		req.body.date = parsedDate.toISOString();
	}

	if (req.body.date) {
		const date = new Date(req.body.date);
		if (isNaN(date.getTime())) return res.status(400).send("Invalid date.");
		req.body.date = date.toISOString();
	}

	fs.readFile("meetups.json", "utf8", (err, data) => {
		if (err) throw err;
		let meetups = JSON.parse(data || "[]");
		const id = parseInt(req.params.id);
		const meetup = meetups.find((m) => m.id === id);
		if (!meetup)
			return res
				.status(404)
				.send("The meetup with the given ID was not found.");
		if (req.body.title) meetup.title = req.body.title;
		if (req.body.summary) meetup.summary = req.body.summary;
		if (req.body.address) meetup.address = req.body.address;
		if (req.body.date) meetup.date = req.body.date;
		fs.writeFile("meetups.json", JSON.stringify(meetups), (err) => {
			if (err) throw err;
			res.send(meetup);
		});
	});
});

app.delete("/meetups/:id", authenticateJWT, (req, res) => {
	fs.readFile("meetups.json", "utf8", (err, data) => {
		if (err) throw err;
		let meetups = JSON.parse(data || "[]");
		const id = parseInt(req.params.id);
		const meetup = meetups.find((m) => m.id === id);
		if (!meetup)
			return res
				.status(404)
				.send("The meetup with the given ID was not found.");
		const index = meetups.indexOf(meetup);
		meetups.splice(index, 1);
		fs.writeFile("meetups.json", JSON.stringify(meetups), (err) => {
			if (err) throw err;
			res.send(meetup);
		});
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	res
		.status(err.status || 500)
		.send({ error: err.message || "Internal Server Error." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));

module.exports = app;
