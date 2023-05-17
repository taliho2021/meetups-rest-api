const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
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
