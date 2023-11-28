const mongoose = require("mongoose");

/**
 * @openapi
 * components:
 *  schemas:
 *   eventsComment:
 *    type: object
 *    description: Comment about recreational event.
 *    properties:
 *     _id:
 *      type: string
 *      description: <b>unique identifier</b> of comment
 *      example: 65140319dae53b4c4262d208
 *     author:
 *      type: string
 *      description: <b>name of the author</b> of the comment
 *      example: igorzgur@gmail.com
 *     rating:
 *      type: integer
 *      description: <b>rating</b> of the location
 *      minimum: 0
 *      maximum: 5
 *      example: 5
 *     comment:
 *      type: string
 *      description: <b>comment</b> about the location
 *      example: Interesting event with only few people.
 *     createdOn:
 *      type: string
 *      description: <b>date</b> of the comment <b>creation</b>
 *      format: date-time
 *      example: 2020-12-25T17:43:00.000Z
 *    required:
 *     - _id
 *     - author
 *     - rating
 *     - comment
 *     - createdOn
 */
const eventsCommentSchema = new mongoose.Schema({
  author: { type: String, required: [true, "Author is required!"] },
  rating: {
    type: Number,
    required: [true, "Rating is required!"],
    min: 0,
    max: 5,
  },
  comment: { type: String, required: [true, "Comment is required!"] },
  createdOn: { type: Date, default: Date.now },
});

/**
 * @openapi
 * components:
 *  schemas:
 *   Event:
 *    type: object
 *    description:  <b>event</b>.
 *    properties:
 *     _id:
 *      type: string
 *      description: unique identifier
 *     id:
 *      type: number
 *      description: internal unique identifier
 *     name:
 *      type: string
 *      description: name of the event
 *     coordinates:
 *      type: array
 *      items:
 *       type: number
 *      minItems: 2
 *      maxItems: 2
 *      description: GPS coordinates of the event
 *     description:
 *      type: string
 *      description: description of the event
 *     type:
 *      type: string
 *      description: type of the event
 *     comments:
 *      type: array
 *      items:
 *       $ref: '#/components/schemas/EventComment'
 *     locationId:
 *      type: string
 *      description: unique identifier of the known event location
 *     location:
 *      type: string
 *      description: textual description of actual event
 *     author:
 *      type: string
 *      description: author
 *     users:
 *      type: array
 *      description: Sports describing the event
 *      items:
 *       type: string
 *     sports:
 *      type: array
 *      description: Sports describing the event
 *      items:
 *       type: string
 *      minItems: 1
 *     rating:
 *      type: integer
 *      description: average rating of the event
 *      minimum: 0
 *      maximum: 5
 *     startDate:
 *      type: string
 *      description: <b>date</b> of the comment <b>creation</b>
 *      format: date-time
 *      example: 2020-12-25T17:43:00.000Z
 *     endDate:
 *      type: string
 *      description: <b>date</b> of the comment <b>creation</b>
 *      format: date-time
 *      example: 2020-12-25T17:43:00.000Z
 *     interval:
 *      type: string
 *      description: interval of event
 *     category:
 *      type: string
 *      description: category of the event
 *     locationAddName:
 *      type: string
 *      description: name of event
 *     distance:
 *      type: number
 *      description: distance from the given event
 *      minimum: 0
 *    required:
 *     - _id
 *     - id
 *     - name
 *     - description
 *     - type
 *     - locationId
 *     - sports
 *     - startDate
 *     - endDate
 *     - category
 *     - interval
 */

const eventSchema = mongoose.Schema({
  id: { type: Number, required: [true, "Unique identifier is required!"],},
  name: { type: String, required: [true, "Name is required!"] },
  coordinates: {
    type: [Number],
    validate: {
      validator: (v) => Array.isArray(v) && v.length == 2,
      message: "Coordinates must be an array of two numbers!",
    },
    index: "2dsphere",
  },
  description: { type: String, required: [true, "Description is required!"] },
  type: { type: String, required: [true, "Type is required!"] },
  comments: {type: [eventsCommentSchema],},
  locationId: { type: String, required: false },
  location: {type: String, required: false},
  author: { type: String, required: false },
  users: { type: [String], required: false },
  sports: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: "At least one keyword is required!",
    },
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  interval: { type: String, required: false},
  category: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: "At least one keyword is required!",
    },
  }, 
  locationAddName: { type: String, required: false}, 
});

mongoose.model("Event", eventSchema, "Events");
