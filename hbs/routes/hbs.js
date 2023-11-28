const express = require("express");
const router = express.Router();
const ctrlLocations = require("../controllers/locations");
const ctrlOther = require("../controllers/other");
const ctrlEvents= require("../controllers/events");

router.get("/", ctrlLocations.list);
router.get("/location", ctrlLocations.details);
router.get("/location/comment/new", ctrlLocations.addComment);
router.get("/about", ctrlOther.about);
router.get("/event", ctrlEvents.details);
router.get("/event/comment/new", ctrlEvents.addEventComment);


module.exports = router;
