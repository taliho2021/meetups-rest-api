const fs = require("fs").promises;

exports.createMeetup = async (req, res, next) => {
	// Your createMeetup logic here
    const { title, summary, address, date } = req.body;
		if (!title || !summary || !address)
			return res
				.status(400)
				.send("Title, summary and address must be non-empty strings.");

		const parsedDate = new Date(date);
		if (isNaN(parsedDate.getTime()))
			return res.status(400).send("Invalid date.");

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
};

exports.getMeetups = async (req, res, next) => {
	// Your getMeetups logic here
    fs.readFile("meetups.json", "utf8", (err, data) => {
			if (err) throw err;
			res.send(JSON.parse(data || "[]"));
		});
};

exports.updateMeetup = async (req, res, next) => {
	// Your updateMeetup logic here
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
};

exports.deleteMeetup = async (req, res, next) => {
	// Your deleteMeetup logic here
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
};
