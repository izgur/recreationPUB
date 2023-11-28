const mongoose = require("mongoose");
const Location = mongoose.model("Location");
const User = mongoose.model("User");
const Event = mongoose.model("Event");

const allowedEventCodelists = [
  "category",
  "type",
  "sports",
  "interval"
];


/* helpers functions */
async function getAllEventIds() {
  const events = await Event.find({}, 'id');
  return events.map(event => event.id);
}

async function findFirstAvailableId() {
  const allEventIds = await getAllEventIds();
  for (let i = 1; i <= allEventIds.length + 1; i++) {
    if (!allEventIds.includes(i)) {
      return i;
    }
  }
}

const getUser = async (req, res, cbResult) => {
  if (req.auth?.email) {
    try {
      const user = await User.findOne({ email: req.auth.email }).exec();
      if (!user) {
        console.log("Events - User not found in database."); // Add a log statement for debugging
        res.status(401).json({ message: "Events - User not found in database." });
      } else {
        cbResult(req, res, user);
      }
    } catch (err) {
      console.error("Events - Error in finding user:", err); // Add an error log for debugging
      res.status(500).json({ message: err.message });
    }
  }
};

const getUserByNickname = async (req, res, cbResult) => {
  if (req.auth?.email) {
    try {
      const user = await User.findOne({ nickname: req.auth.nickname }).exec();
      if (!user) {
        console.log("Events - User not found in database."); // Add a log statement for debugging
        res.status(401).json({ message: "Events - User not found in database." });
      } else {
        cbResult(req, res, user);
      }
    } catch (err) {
      console.error("Events - Error in finding user:", err); // Add an error log for debugging
      res.status(500).json({ message: err.message });
    }
  }
};

const getAuthor = async (req, res, cbResult) => {
  if (req.auth?.email) {
    try {
      let user = await User.findOne({ email: req.auth.email }).exec();
      if (!user) res.status(401).json({ message: "User not found." });
      else cbResult(req, res, user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

  /**
 * @openapi
 * /events:
 *  post:
 *   summary: Add a new event to a given location...
 *   description: Add a new **event** with name, description, type, location, start Date, end Date, interval, category and additional location name if needed
 *   tags: [Events]
 *   security:
 *    - jwt: []
 *   requestBody:
 *    description: Comment's author, rating and content.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of event
 *         example: Sponsored event at City Park Maribor
 *        description:
 *         type: string
 *         description: <b>description</b> of event
 *         example: Football and basketball event through all day
 *        type:
 *         type: string
 *         description: <b>name</b> of event
 *         example: outdoor
 *        locationId:
 *         type: string
 *         description: <b>locationId</b> of event
 *         example: 65140319dae53b4c4262d52b
 *        sports:
 *         type: array
 *         items:
 *          type: string
 *         description: <b>sports</b> of the event
 *         example: ["outdoor football", "basketball"]
 *        startDate:
 *         type: string
 *         description: Start date and time of the event
 *         format: date-time
 *         example: "2023-11-21T08:00:00Z"
 *        endDate:
 *         type: string
 *         description: End date and time of the event
 *         format: date-time
 *         example: "2023-11-21T10:00:00Z"
 *        interval:
 *         type: string
 *         description: <b>interval</b> of event
 *         enum:
 *          - once a week
 *          - twice a week
 *          - 3 times a week
 *          - 4 times a week
 *          - daily
 *          - monthly
 *          - yearly
 *        category:
 *         type: array
 *         items:
 *          type: string
 *         description: Categories of the event
 *         example: ["team"]
 *        locationAddName:
 *         type: string
 *         description: <b>Additional name</b> of event
 *         example: At Domino's
 *       required:
 *        - name
 *        - description
 *        - type
 *        - locationId
 *        - sports
 *        - startDate
 *        - endDate
 *        - interval
 *        - category
 *        - locationAddName
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with events details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Events'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        locationId is required:
 *         value:
 *          message: Path parameter 'locationId' is required for inserting event.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: Swagger Unauthorized - No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not Found in POST events request.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
  const eventsCreate = async (req, res) => {
    getUser(req, res, async (req, res, user) => {
      if (!req.body.locationId)
        res
          .status(400)
          .json({ message: "Path parameter 'locationId' is required." });
      else {
        try {
          // Check if the location with the specified ID exists
          const location = await Location.findById(req.body.locationId).exec();
          
          if (!location) {
            // Return an error response if location is not found
            return res.status(404).json({ message: "Location with the specified 'locationId' doesn't exist." });
          }
  
          findFirstAvailableId().then((firstAvailableId) => {
            if (typeof req.body.category === 'string' && req.body.category.includes(',')) {
              req.body.category = req.body.category.split(',');
            } else if (!Array.isArray(req.body.category)) {
              req.body.category = [req.body.category];
            }
  
            if (typeof req.body.sports === 'string' && req.body.sports.includes(',')) {
              req.body.sports = req.body.sports.split(',');
            } else if (!Array.isArray(req.body.sports)) {
              req.body.sports = [req.body.sports];
            }
  
            // Create the Event object and save it inside the then block
            const eventToAdd = new Event({
              id: firstAvailableId,
              name: req.body.name,
              coordinates: location.coordinates,
              category: req.body.category,
              description: req.body.description,
              type: req.body.type,
              author: user.email,
              sports: req.body.sports,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              interval: req.body.interval,
              locationId: req.body.locationId
            });

  
            eventToAdd.save()
              .then(savedEvent => {
                console.log(`Inserting event id: ${savedEvent.id}, name: ${savedEvent.name}, author: ${savedEvent.author}`);
                res.status(201).json(savedEvent);
              })
              .catch(err => {
                res.status(500).json({ message: err.message });
              });
          });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    });
  };

/**
 * @openapi
 * /events/{eventId}:
 *  put:
 *   summary: Change existing event
 *   description: Change existing **event** with name, description, type, locationId, sports, startDate, endDate, category, interval and location additional name.
 *   tags: [Events]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: eventId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of event
 *      required: true
 *      example: 6536b5f4775d4c3d9636180e
 *   requestBody:
 *    description: Event name, description, type, locationId, sports, startDate, endDate, category, interval and location additional name.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of event
 *         example: Sponsored event at City Park Maribor
 *        description:
 *         type: string
 *         description: <b>description</b> of event
 *         example: Football and basketball event through all day
 *        type:
 *         type: string
 *         description: <b>name</b> of event
 *         example: outdoor
 *        locationId:
 *         type: string
 *         description: <b>locationId</b> of event
 *         example: 65140319dae53b4c4262d52b
 *        sports:
 *         type: array
 *         items:
 *          type: string
 *         description: <b>sports</b> of the event
 *         example: ["outdoor football", "basketball"]
 *        startDate:
 *         type: string
 *         description: Start date and time of the event
 *         format: date-time
 *         example: "2023-11-21T08:00:00Z"
 *        endDate:
 *         type: string
 *         description: End date and time of the event
 *         format: date-time
 *         example: "2023-11-21T10:00:00Z"
 *        interval:
 *         type: string
 *         description: <b>interval</b> of event
 *         enum:
 *          - once a week
 *          - twice a week
 *          - 3 times a week
 *          - 4 times a week
 *          - daily
 *          - monthly
 *          - yearly
 *        category:
 *         type: array
 *         items:
 *          type: string
 *         description: Categories of the event
 *         example: ["team"]
 *        locationAddName:
 *         type: string
 *         description: <b>Additional name</b> of event
 *         example: At Domino's
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated event details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Event'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        eventId is required:
 *         value:
 *          message: Path parameters 'eventId' is required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *        malformed token:
 *         value:
 *          message: jwt malformed
 *        invalid token signature:
 *         value:
 *          message: invalid signature
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to update this event.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        event not found:
 *         value:
 *          message: Event with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const eventsUpdateOne = async (req, res) => {
  if (!req.params.eventId)
    res.status(400).json({
      message: "Path parameters 'eventId' is required.",
    });
  else {
    try {
      let event = await Event.findById(req.params.eventId).exec();
      if (!event)
        res.status(404).json({
          message: `Event with id '${req.params.eventId}' not found.`,
        });
      else {
        getAuthor(req, res, async (req, res, author) => {
          if (event.author != author.email) {
            res.status(403).json({
              message: "Not authorized to update this event.",
            });
          } else {
            if (typeof req.body.category === 'string' && req.body.category.includes(',')) {
              req.body.category = req.body.category.split(',');
            } else if (!Array.isArray(req.body.category)) {
              req.body.category = [req.body.category];
            }
  
            if (typeof req.body.sports === 'string' && req.body.sports.includes(',')) {
              req.body.sports = req.body.sports.split(',');
            } else if (!Array.isArray(req.body.sports)) {
              req.body.sports = [req.body.sports];
            }
            if (req.body.name) event.name = req.body.name;
            if (req.body.description) event.description = req.body.description;
            if (req.body.type) event.type = req.body.type;
            if (req.body.locationId) event.locationId = req.body.locationId;
            if (req.body.sports) event.sports = req.body.sports;
            if (req.body.startDate) event.startDate = req.body.startDate;
            if (req.body.endDate) event.endDate = req.body.endDate;
            if (req.body.interval) event.interval = req.body.interval;
            if (req.body.category) event.category = req.body.category;
            if (req.body.locationAddName) event.locationAddName = req.body.locationAddName;
            await event.save();
            res.status(200).json(event);
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /events/{eventId}:
 *  delete:
 *   summary: Delete existing event.
 *   description: Delete existing **event** with given unique identifier.
 *   tags: [Events]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: eventId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of event
 *      required: true
 *      example: 6536b5f4775d4c3d9636180e
 *   responses:
 *    '204':
 *     description: <b>No Content</b>, with no content.
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Path parameters 'eventId' is required for deleting event.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *        malformed token:
 *         value:
 *          message: jwt malformed
 *        invalid token signature:
 *         value:
 *          message: invalid signature
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to delete this event.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        event not found:
 *         value:
 *          message: Event with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const eventsDeleteOne = async (req, res) => {
  if (!req.params.eventId)
    res.status(400).json({
      message: "Path parameter 'eventId' is required.",
    });
  else {
    try {
      let event = await Event.findById(req.params.eventId).exec();
      if (!event)
        res.status(404).json({
          message: `Event with id '${eventId}' not found when deleting event.`,
        });
      else {
        getAuthor(req, res, async (req, res, author) => {
          if (event.author != author.email) {
            res.status(403).json({
              message: "Not authorized to delete this event.",
            });
          } else {
            console.log(`Deleting event id: ${event.id}, name: ${event.name}, author: ${event.author}`);
            event.deleteOne();
            res.status(204).send();
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 *  /events/all:
 *   get:
 *    summary: Retrieve all events .
 *    description: Retrieve all options for event.
 *    tags: [Events]
 *    parameters:
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of events.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Event'
 *        example:
 *         - _id: 65366936b92f8bde8ca87baf
 *           id: 13
 *           name: 'Sponsored event at City Park Maribor'
 *           coordinates: [ 15.649, 46.5568 ]
 *           description: 'Football and basketball event through all day'
 *           type: 'outdoor'
 *           locationId: '65140319dae53b4c4262d52b'
 *           author: 'igorzgur@gmail.com'
 *           users: ['igorzgur@gmail.com', "test@gmail.com"]
 *           sports: [ 'outdoor football', 'basketball' ]
 *           rating: 3
 *           startDate: ISODate("2023-11-21T08:00:00.000Z")
 *           endDate: ISODate("2023-11-21T10:00:00.000Z")
 *           interval: 'once a week'
 *           category: [ 'team' ]
 *           distance: 858.0692052049162
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No events found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "500 Internal Server error when retrieving /events/all"
 */
const eventsListAll = async (req, res) => {
  console.log("in eventsListAll");
  let nResults = parseInt(req.query.nResults);
  nResults = isNaN(nResults) ? 10 : nResults;
  try {
    let events = await Event.aggregate([{ $limit: nResults }]);
    if (!events || events.length == 0)
      res.status(404).json({ message: "eventsListAll - No events found." });
    else res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};

/**
 * @openapi
 *  /events/paginated:
 *   get:
 *    summary: Retrieve all events - 10 for every page number.
 *    description: Retrieve all options for event.
 *    tags: [Events]
 *    parameters:
 *     - name: page
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 1
 *       description: <b>pagination number</b> to be retrieved
 *     - name: limit
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: <b>limitation</b> of results to be retrieved on one page
 *     - name: lat
 *       in: query
 *       required: true
 *       description: <b>latitude</b> of the event
 *       schema:
 *        type: number
 *        minimum: -180
 *        maximum: 180
 *       example: 46.5568
 *     - name: lng
 *       in: query
 *       required: true
 *       description: <b>longitude</b> of the event
 *       schema:
 *        type: number
 *        minimum: -90
 *        maximum: 90
 *       example: 15.649
 *     - name: maxDistance
 *       in: query
 *       schema:
 *        type: number
 *        minimum: 0
 *        default: 5
 *       description: maximum <b>distance</b> in kilometers
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of events.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Event'
 *        example:
 *         - _id: 65366936b92f8bde8ca87baf
 *           id: 13
 *           name: 'Sponsored event at City Park Maribor'
 *           coordinates: [ 15.649, 46.5568 ]
 *           description: 'Football and basketball event through all day'
 *           type: 'outdoor'
 *           locationId: '65140319dae53b4c4262d52b'
 *           author: 'igorzgur@gmail.com'
 *           users: ['igorzgur@gmail.com', "test@gmail.com"]
 *           sports: [ 'outdoor football', 'basketball' ]
 *           rating: 3
 *           startDate: ISODate("2023-11-21T08:00:00.000Z")
 *           endDate: ISODate("2023-11-21T10:00:00.000Z")
 *           interval: 'once a week'
 *           category: [ 'team' ]
 *           distance: 858.0692052049162
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No events found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "500 Internal Server error when retrieving /events/all"
 */

const eventsListPaginated = async (req, res) => {
  console.log("in eventsListPaginated");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let lng = parseFloat(req.query.lng);
  let lat = parseFloat(req.query.lat);
  let distance = parseFloat(req.query.maxDistance);
  distance = 1000 * (isNaN(distance) ? 5 : distance);
  //console.log("API eventsListPaginated page: " + page + " limit: " + limit + " lng: " + lng + " lat: " + lat + " distance: " + distance );
  try {
    let events = await Event.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: distance,
        },
      },
     // { $project: { comments: false, id: false } },
    ])      .skip((page - 1) * limit)
    .limit(limit)
    .exec();
    console.log("paginated events: " + events.length)

    // Fetch total count for pagination info
    const totalCount = await Event.countDocuments();
    res.status(200).json({
      events,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 *  /events/distance:
 *   get:
 *    summary: Retrieve events within a given distance.
 *    description: Retrieve **events within a given distance** from a given event.
 *    tags: [Events]
 *    parameters:
 *     - name: lat
 *       in: query
 *       required: true
 *       description: <b>latitude</b> of the event
 *       schema:
 *        type: number
 *        minimum: -180
 *        maximum: 180
 *       example: 46.5568
 *     - name: lng
 *       in: query
 *       required: true
 *       description: <b>longitude</b> of the event
 *       schema:
 *        type: number
 *        minimum: -90
 *        maximum: 90
 *       example: 15.649
 *     - name: distance
 *       in: query
 *       schema:
 *        type: number
 *        minimum: 0
 *        default: 5
 *       description: maximum <b>distance</b> in kilometers
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of events.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Event'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: First Gimnasium Maribor
 *           category: individual, pairs, team
 *           type: indoor, outdoor, water
 *           sports: football
 *           description: Zelo velika telovadnica
 *           event: V ližini centra.
 *           coordinates: [14.4765778196, 46.0557820208]
 *           author: igorzgur
 *           interval: once a week
 *           distance: 858.0692052049162
 *     '400':
 *      description: <b>Bad Request</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Query parameters 'lng' and 'lat' are required"
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No events found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const eventsListByDistance = async (req, res) => {
  console.log("in eventsListByDistance");
  let lng = parseFloat(req.query.lng);
  let lat = parseFloat(req.query.lat);
  let distance = parseFloat(req.query.maxDistance);
  distance = 1000 * (isNaN(distance) ? 5 : distance);
  let nResults = parseInt(req.query.nResults);
  nResults = isNaN(nResults) ? 10 : nResults;
  if (!lng || !lat)
    res
      .status(400)
      .json({ message: "Query parameters 'lng' and 'lat' are required." });
  else {
    try {
      let events = await Event.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lng, lat],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance: distance,
          },
        },
        { $project: { comments: false, id: false } },
        { $limit: nResults },
      ]);
      console.log("conut events: " + events.length)
      if (!events || events.length == 0)
        res.status(404).json({ message: "No events found." });
      else res.status(200).json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /events/search:
 *   get:
 *    summary: Retrieve events filtered by codelist values.
 *    description: Retrieve **recreations limited with** selected **codelist's values**.
 *    tags: [Events]
 *    parameters:
 *     - name: category
 *       in: query
 *       description: <b>category</b> of the event
 *       schema:
 *        type: string
 *        enum:
 *         - individual
 *         - pairs
 *         - team
 *     - name: type
 *       in: query
 *       description: <b>type</b> of the event
 *       schema:
 *        type: string
 *        enum:
 *         - indoor
 *         - outdoor
 *         - water
 *     - name: sports
 *       in: query
 *       description: <b>sports</b> of the event
 *       schema:
 *        type: string
 *        enum:
 *         - football
 *         - baseball
 *         - supping
 *         - hockey
 *         - outdoor football
 *         - hiking
 *         - basketball 
 *     - name: interval
 *       in: query
 *       description: <b>interval</b> of the event
 *       schema:
 *        type: string
 *        enum:
 *         - once a week
 *         - twice a week
 *         - 3 times a week
 *         - 4 times a week
 *         - daily
 *         - monthly
 *         - yearly
 *     - name: startDate
 *       in: query
 *       description: Start date of the event
 *       schema:
 *        type: string
 *        format: date-time
 *       example: '2023-09-21T00:32:28Z'
 *     - name: endDate
 *       in: query
 *       description: End date of the event
 *       schema:
 *        type: string
 *        format: date-time
 *       example: '2030-09-21T00:32:28Z'
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of events.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Event'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Ljubljana - Cankarjeva spominska soba na Rožniku
 *           category: spominski objekti in kraji
 *           type: memorialna dediščina
 *           sports: spominska soba
 *           description: Spominska soba, posvečena Ivanu Cankarju, je bila urejena leta 1948 in prenovljena v letih 1965 in 1998. Pisatelj je na Rožniku živel v letih 1910 - 1917, muzejsko postavitev je pripravil Mestni muzej Ljubljana.
 *           event: Spominska soba je urejena v stavbi, ki stoji nasproti gostilne Rožnik, na Cankarjevem vrhu (Rožnik).
 *           coordinates: [14.4765778196, 46.0557820208]
 *           author: igorzgur
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No events found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const eventsListByMultiFilter = async (req, res) => {
  let filter = [];
  // Exclude fields
  filter.push({ $project: { comments: false, id: false } });
  // Filter by codelist if provided
  allowedEventCodelists.forEach((codelist) => {
    let value = req.query[codelist];
    if (value) filter.push({ $match: { [codelist]: value } });
  });

  // Filter by startDate and endDate if provided
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    // Check if startDate is before endDate
    if (startDate > endDate) {
      return res.status(400).json({ message: "Invalid date range: startDate is after endDate when retrieving eventsListByMultiFilter." });
    }
    filter.push({
      $match: {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      },
    });
  }

  // Maximum number of results
  let nResults = parseInt(req.query.nResults);
  nResults = isNaN(nResults) ? 10 : nResults;
  filter.push({ $limit: nResults });

  // Perform database search and return results
  try {
    let events = await Event.aggregate(filter).exec();
    if (!events || events.length === 0)
      res.status(404).json({ message: "No recreation events found." });
    else res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /events/{eventId}:
 *   get:
 *    summary: Retrieve details of a given event.
 *    description: Retrieve **recreation possibility details** for a given event.
 *    tags: [Events]
 *    parameters:
 *    - name: eventId
 *      in: path
 *      required: true
 *      description: <b>unique identifier</b> of event
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      example: 6536b5f4775d4c3d9636180e
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with event details.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Event'
 *        example:
 *         _id: 
 *         name: School I
 *         category: indoor, outdoor, water
 *         type: profana stavbna dediščina
 *         sports: [football, basketball, baseball, supping]
 *         description: Muzej na prostem sestavljajo skupina 17 kozolcev različnih tipov in dve enostavni sušilni napravi (belokranjska ostrv in ribniški kozouček). Postavitev iz 2012 prikazuje genezo kozolca na Slovenskem in raznolikost kozolcev v Mirnski dolini.
 *         event: Muzej na prostem je urejen na južnem obrobju Šentruperta na Dolenjskem.
 *         coordinates: [15.0914351743,45.9748324693]
 *         comments: []
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Event with id '735a62f5dc5d7968e68464c1' not found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Cast to ObjectId failed for value \"1\" (type string) at path \"_id\" for model \"Event\""
 */
const eventsReadOne = async (req, res) => {
  try {
    let event = await Event.findById(req.params.eventId)
      .select("-id")
      .exec();
    if (!event)
      res.status(404).json({
        message: `Event with id '${req.params.eventId}' not found`,
      });
    else res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /events/codelist/{codelist}:
 *  get:
 *   summary: Retrieve codelist values.
 *   description: Allowed **codelist values** for given codelist name.
 *   tags: [Events]
 *   parameters:
 *    - name: codelist
 *      in: path
 *      required: true
 *      description: codelist <b>name</b>
 *      schema:
 *       $ref: '#/components/schemas/Codelist'
 *      example: category
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with codelist values.
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         type: string
 *       example: ["indoor", "outdoor", "water"]
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        codelist not found:
 *         value:
 *          message: "No codelist found for 'custom category'."
 *        codelist not allowed:
 *         value:
 *          message: "Parameter 'codelist must be one of: category, type, sports'"
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const eventsListCodelist = async (req, res) => {
  let codelist = req.params.codelist;
  if (!allowedEventCodelists.includes(codelist))
    res.status(400).json({
      message: `Parameter 'codelist' must be one of: ${allowedEventCodelists.join(
        ", "
      )}`,
    });
  else {
    try {
      let codeListValues = await Event.distinct(codelist).exec();
      if (!codeListValues || codeListValues.length === 0)
        res
          .status(404)
          .json({ message: `No codelist found for '${codelist}.'` });
      else res.status(200).json(codeListValues);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /events/{eventId}/users:
 *  post:
 *   summary: Add a new user as a participant of the event.
 *   description: Add a new user to event.
 *   tags: [Events]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: eventId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of event
 *      required: true
 *      example: 655a7e7b42625fa6ccfc780a
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with event details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Event'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        eventId is required:
 *         value:
 *          message: Path parameter 'eventId' is required.
 *        use is required:
 *         value:
 *          message: Body parameters 'user' is required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Event with id '735a62f5dc5d7968e68467e3' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const usersCreate = async (req, res) => {
  getUser(req, res, async (req, res, user) => {
    const { eventId } = req.params;
    if (!eventId)
      res
        .status(400)
        .json({ message: "Path parameter 'eventId' is required." });
    else {
      try {
        let event = await Event.findById(eventId)
          .select("users")
          .exec();
        
        if (!event) {
          res.status(404).json({message: `Event with id '${eventId}' not found.`,});
        } else if (event.users && event.users.length > 0) {
          if (event.users && event.users.includes(user.nickname)) {
            res.status(409).json({ message: "User already registered for this event."});
          } else {
            doAddUserToEvent(req, res, event, user.nickname);
          }
        } else {
          doAddUserToEvent(req, res, event, user.nickname);
      }
            
        
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};

const doAddUserToEvent = async (req, res, event, user) => {
  if (!event || !user) {
    return res.status(400).json({
      message: "Body parameters 'eventId' and 'user' are required.",
    });
  } else {
    try {
      event.users.push(user); // Push the user string directly into the array
      // Save the event using the Mongoose model's save method
      const savedEvent = await event.save();

      res.status(201).json(savedEvent.users.slice(-1).pop());
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /events/{eventId}/users/{user}:
 *  delete:
 *   summary: Delete user from event
 *   description: Delete existing user from event
 *   tags: [Events]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: eventId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of event
 *      required: true
 *      example: 655a7e7b42625fa6ccfc780a
 *    - name: user
 *      in: path
 *      schema:
 *       type: string
 *      description: <b>nickname</b> of user
 *      required: true
 *      example: test3
 *   responses:
 *    '204':
 *     description: Your <b>User</b> is deleted from event.
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Path parameters 'eventId' is required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *        malformed token:
 *         value:
 *          message: jwt malformed
 *        invalid token signature:
 *         value:
 *          message: invalid signature
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to delete this user.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        event not found:
 *         value:
 *          message: Event with id '655a7e7b42625fa6ccfc780a' not found.
 *        comment not found:
 *         value:
 *          message: User not found.
 *        no users found:
 *         value:
 *          message: No users found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const usersDeleteOne = async (req, res) => {
  const { eventId, user } = req.params;
  if (!eventId)
    res.status(400).json({
      message: "Path parameters 'eventId' and 'user' are required.",
    });
  else {
    try {
      let event = await Event.findById(eventId)
        .select("users")
        .exec();
      if (!event)
        res.status(404).json({
          message: `Event with id '${eventId}' not found.`,
        });
      else if (event.users && event.users.length > 0) {
                                 getUser(req, res, async (req, res, authUser) => {
          if (event.users && event.users.includes(authUser.nickname)) {
            // User's nickname is in the event.users array
            event.users = event.users.filter((nickname) => nickname !== user);
          
            try {
              await event.save();
              res.status(204).send();
            } catch (err) {
              res.status(500).json({ message: err.message });
            }
          } else {
            // User's nickname is not in the event.users array
            res.status(200).json({ message: `User is not in event users.` });
          }
        });  
      } else res.status(404).json({ message: "No users found." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = {
  eventsCreate,
  eventsUpdateOne,
  eventsDeleteOne,
  eventsListAll,
  eventsListPaginated,
  eventsListByDistance,
  eventsListByMultiFilter,
  eventsListCodelist,
  eventsReadOne,
  usersCreate,
  usersDeleteOne,
};
