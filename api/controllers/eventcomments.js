const mongoose = require("mongoose");
const Event = mongoose.model("Event");
const User = mongoose.model("User");

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
 * /events/{eventId}/comments:
 *  post:
 *   summary: Add a new comment to a given event.
 *   description: Add a new **comment** with author's name, rating and comment's content to a event with given unique identifier.
 *   tags: [EventsComment]
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
 *    description: Comment's author, rating and content.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        rating:
 *         type: integer
 *         description: <b>rating</b> of comment
 *         minimum: 1
 *         maximum: 5
 *         enum: [1, 2, 3, 4, 5]
 *         example: 3
 *        comment:
 *         type: string
 *         description: <b>content</b> of comment
 *         example: Srednja žalost.
 *       required:
 *        - rating
 *        - comment
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with comment details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
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
 *        author, rating and comment are required:
 *         value:
 *          message: Body parameters 'author', 'rating' and 'comment' are required.
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
const commentsCreate = async (req, res) => {
  getAuthor(req, res, async (req, res, author) => {
    const { eventId } = req.params;
    if (!eventId)
      res
        .status(400)
        .json({ message: "Path parameter 'eventId' is required." });
    else {
      try {
        let event = await Event.findById(eventId)
          .select("comments")
          .exec();
        doAddComment(req, res, event, author.email);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};

const doAddComment = async (req, res, event, author) => {
  if (!event)
    res.status(404).json({
      message: `Event with id '${req.params.eventId}' not found.`,
    });
  else if (!req.body.rating || !req.body.comment)
    res.status(400).json({
      message: "Body parameters 'author', 'rating' and 'comment' are required.",
    });
  else {
    event.comments.push({
      author: author,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    try {
      await event.save();
      await updateAverageRating(event._id);
      res.status(201).json(event.comments.slice(-1).pop());
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const updateAverageRating = async (eventId) => {
  try {
    let event = await Event.findById(eventId)
      .select("rating comments")
      .exec();
    doSetAverageRating(event);
  } catch (err) {}
};

const doSetAverageRating = async (event) => {
  if (!event.comments || event.comments.length == 0) event.rating = 0;
  else {
    const count = event.comments.length;
    const total = event.comments.reduce((acc, { rating }) => {
      return acc + rating;
    }, 0);
    event.rating = parseInt(total / count, 10);
  }
  try {
    await event.save();
    console.log(`Average rating updated to ${event.rating}.`);
  } catch (err) {
    console.log(err);
  }
};

/**
 * @openapi
 * /events/{eventId}/comments/{commentId}:
 *  get:
 *   summary: Retrieve a specific comment of a given event.
 *   description: Retrieve details of a **comment** of a given recreation possibility.
 *   tags: [EventsComment]
 *   parameters:
 *    - name: eventId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of event
 *      example: 6536b5f4775d4c3d9636180e
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of comment
 *      example: 65140319dae53b4c4262d208
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with event details.
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         event:
 *          type: object
 *          properties:
 *           _id:
 *            type: string
 *            description: <b>unique identifier</b> of event
 *            example: 
 *           name:
 *            type: string
 *            description: <b>name</b> of the event
 *            example: Celje - Celjski grad
 *         comment:
 *          $ref: '#/components/schemas/Comment'
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        event not found:
 *         value:
 *          message: "Event with id '' not found."
 *        comment not found:
 *         value:
 *          message: "Comment with id '1' not found."
 *        no comments found:
 *         value:
 *          message: "No comments found."
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsReadOne = async (req, res) => {
  try {
    let event = await Event.findById(req.params.eventId)
      .select("name comments")
      .exec();
    if (!event)
      res.status(404).json({
        message: `Event with id '${req.params.eventId}' not found`,
      });
    else if (!event.comments || event.comments.length == 0)
      res.status(404).json({ message: "No comments found." });
    else {
      let comment = event.comments.id(req.params.commentId);
      if (!comment)
        res.status(404).json({
          message: `Comment with id '${req.params.commentId}' not found.`,
        });
      else {
        res.status(200).json({
          event: {
            _id: req.params.eventId,
            name: event.name,
          },
          comment,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /events/{eventId}/comments/{commentId}:
 *  put:
 *   summary: Change existing comment to a given event.
 *   description: Change existing **comment** with author's name, rating and comment's content (at least 1 value) to a event with given unique identifier.
 *   tags: [EventsComment]
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
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of comment
 *      required: true
 *      example: 65140319dae53b4c4262d208
 *   requestBody:
 *    description: Comment's author, rating and content.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        rating:
 *         type: integer
 *         description: <b>rating</b> of comment
 *         minimum: 1
 *         maximum: 5
 *         enum: [1, 2, 3, 4, 5]
 *         example: 3
 *        comment:
 *         type: string
 *         description: <b>content</b> of comment
 *         example: Srednja žalost.
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated comment details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        eventId and commentId are required:
 *         value:
 *          message: Path parameters 'eventId' and 'commentId' are required.
 *        rating or comment is required:
 *         value:
 *          message: At least on of body parameters 'rating' or 'comment' is required.
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
 *        message: Not authorized to update this comment.
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
 *        comment not found:
 *         value:
 *          message: Comment with id '736346e7171e084ff4e4bbf9' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsUpdateOne = async (req, res) => {
  if (!req.params.eventId || !req.params.commentId)
    res.status(400).json({
      message: "Path parameters 'eventId' and 'commentId' are required.",
    });
  else {
    try {
      let event = await Event.findById(req.params.eventId)
        .select("comments")
        .exec();
      if (!event)
        res.status(404).json({
          message: `Event with id '${req.params.eventId}' not found.`,
        });
      else {
        const comment = event.comments.id(req.params.commentId);
        if (!comment)
          res.status(404).json({
            message:
              "Comment with id '" + req.params.commentId + "' not found.",
          });
        else {
          getAuthor(req, res, async (req, res, author) => {
            if (comment.author != author.email) {
              res.status(403).json({
                message: "Not authorized to update this comment.",
              });
            } else if (!req.body.rating && !req.body.comment) {
              res.status(400).json({
                message:
                  "At least on of body parameters 'rating' or 'comment' is required.",
              });
            } else {
              if (req.body.rating) comment.rating = req.body.rating;
              if (req.body.comment) comment.comment = req.body.comment;
              await event.save();
              await updateAverageRating(event._id);
              res.status(200).json(comment);
            }
          });
        }
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /events/{eventId}/comments/{commentId}:
 *  delete:
 *   summary: Delete existing comment from a given event.
 *   description: Delete existing **comment** with a given unique identifier from a event with given unique identifier.
 *   tags: [EventsComment]
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
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of comment
 *      required: true
 *      example: 65140319dae53b4c4262d208
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
 *        message: Path parameters 'eventId' and 'commentId' are required.
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
 *        message: Not authorized to delete this comment.
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
 *        comment not found:
 *         value:
 *          message: Comment with id '736346e7171e084ff4e4bbf9' not found.
 *        no comments found:
 *         value:
 *          message: No comments found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsDeleteOne = async (req, res) => {
  const { eventId, commentId } = req.params;
  if (!eventId || !commentId)
    res.status(400).json({
      message: "Path parameters 'eventId' and 'commentId' are required.",
    });
  else {
    try {
      let event = await Event.findById(eventId)
        .select("comments")
        .exec();
      if (!event)
        res.status(404).json({
          message: `Event with id '${eventId}' not found.`,
        });
      else if (event.comments && event.comments.length > 0) {
        const comment = event.comments.id(commentId);
        if (!comment)
          res.status(404).json({
            message: `Comment with id '${commentId}' not found.`,
          });
        else {
          getAuthor(req, res, async (req, res, author) => {
            if (comment.author != author.email) {
              res.status(403).json({
                message: "Not authorized to delete this comment.",
              });
            } else {
              comment.deleteOne();
              await event.save();
              await updateAverageRating(event._id);
              res.status(204).send();
            }
          });
        }
      } else res.status(404).json({ message: "No comments found." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = {
  commentsCreate,
  commentsReadOne,
  commentsUpdateOne,
  commentsDeleteOne,
};
