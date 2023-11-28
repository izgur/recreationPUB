const express = require("express");
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: "payload",
  algorithms: ["HS256"],
});
const ctrlLocations = require("../controllers/locations");
const ctrlComments = require("../controllers/comments");
const ctrlEvents = require("../controllers/events");
const ctrlEventComments = require("../controllers/eventcomments");
const ctrlAuthentication = require("../controllers/authentication");
const ctrlSports = require("../controllers/sports.js");


/**
 * Sports
 */
router.get("/sports/all", ctrlSports.sportsListAll);
router.get("/sports/search", ctrlSports.sportsListByMultiFilter);
router.post(
  "/sports",
  auth,
  ctrlSports.sportsCreate
);

/**
 * Locations
 */
router.get("/locations/all", ctrlLocations.locationsListAll);
router.get("/locations/distance", ctrlLocations.locationsListByDistance);
router.get("/locations/search", ctrlLocations.locationsListByMultiFilter);
router.get(
  "/locations/codelist/:codelist",
  ctrlLocations.locationsListCodelist
);
router.get("/locations/:locationId", ctrlLocations.locationsReadOne);


/**
 * Comments
 */
router.post(
  "/locations/:locationId/comments",
  auth,
  ctrlComments.commentsCreate
);
router
  .route("/locations/:locationId/comments/:commentId")
  .get(ctrlComments.commentsReadOne)
  .put(auth, ctrlComments.commentsUpdateOne)
  .delete(auth, ctrlComments.commentsDeleteOne);


/**
 * Events
 */

router.post("/events", auth, ctrlEvents.eventsCreate);
router.get("/events/all", ctrlEvents.eventsListAll);
router.get("/events/paginated", ctrlEvents.eventsListPaginated);
router.get("/events/distance", ctrlEvents.eventsListByDistance);
router.get("/events/search", ctrlEvents.eventsListByMultiFilter);
router.get("/events/codelist/:codelist",ctrlEvents.eventsListCodelist);
router.post("/events/:eventId/users", auth, ctrlEvents.usersCreate);
router.delete("/events/:eventId/users/:user", auth, ctrlEvents.usersDeleteOne);
router
  .route("/events/:eventId")
  .get(ctrlEvents.eventsReadOne)
  .put(auth, ctrlEvents.eventsUpdateOne)
  .delete(auth, ctrlEvents.eventsDeleteOne);

/**
 * Comments
 */
router.post(
  "/events/:eventId/comments",
  auth,
  ctrlEventComments.commentsCreate
);
router
  .route("/events/:eventId/comments/:commentId")
  .get(ctrlEventComments.commentsReadOne)
  .put(auth, ctrlEventComments.commentsUpdateOne)
  .delete(auth, ctrlEventComments.commentsDeleteOne);

/**
 * Authentication
 */
router.post("/register", ctrlAuthentication.register);
router.post("/login", ctrlAuthentication.login);

module.exports = router;
