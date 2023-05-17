const express = require("express");
const router = express.Router();

const {
	createMeetup,
	getMeetups,
	updateMeetup,
	deleteMeetup,
} = require("../controllers/meetupController");
const authenticateJWT = require("../middleware/authenticateJWT");

router.post("/", authenticateJWT, createMeetup);
router.get("/", getMeetups);
router.patch("/:id", authenticateJWT, updateMeetup);
router.delete("/:id", authenticateJWT, deleteMeetup);

module.exports = router;
