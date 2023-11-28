const mongoose = require("mongoose");
const Sport = mongoose.model("Sport");


const allowedCodelists = [
    "category"
  ];

/**
 * @openapi
 *  /sports/all:
 *   get:
 *    summary: Retrieve all sports ...
 *    description: Retrieve all sports for recreation.
 *    tags: [Sports]
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
 *      description: <b>OK</b>, with list of sports.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Sport'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: football
 *           category: ["team", "individual"]
 *     '400':
 *      description: <b>Bad Request</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: ["Bad requesnt on getting all sports"]
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No sports found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Internal Server Error while gettings sports all"
 */
const sportsListAll = async (req, res) => {
    console.log("in sportsListAll");
    let nResults = parseInt(req.query.nResults);
    nResults = isNaN(nResults) ? 10 : nResults;
    try {
      let sports = await Sport.aggregate([{ $limit: nResults }]);
      if (!sports || sports.length == 0)
        res.status(404).json({ message: "sportsListAll - No sports found." });
      else res.status(200).json(sports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    
  };

  
/**
 * @openapi
 * /sports/search:
 *   get:
 *    summary: Retrieve sports filtered by codelist values.
 *    description: Retrieve **sports limited with** selected **codelist's values**.
 *    tags: [Sports]
 *    parameters:
 *     - name: category
 *       in: query
 *       description: <b>category</b> of the sport
 *       schema:
 *        type: string
 *        enum:
 *         - team
 *         - individual
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of locations.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Sport'
 *        example:
 *         - _id: 6536bf504d14093bee7c1662
 *           name: football
 *           category: team
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No sports found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Internal Server Error when searching for sports"
 */
const sportsListByMultiFilter = async (req, res) => {
    let filter = [];
    // Exclude fields
    filter.push({ $project: { comments: false, id: false } });
    // Filter by codelist if provided
    allowedCodelists.forEach((codelist) => {
      let value = req.query[codelist];
      if (value) filter.push({ $match: { [codelist]: value } });
    });
    // Maximum number of results
    let nResults = parseInt(req.query.nResults);
    nResults = isNaN(nResults) ? 10 : nResults;
    filter.push({ $limit: nResults });
    // Perform database search and return results
    try {
      let sports = await Sport.aggregate(filter).exec();
      if (!sports || sports.length === 0)
        res.status(404).json({ message: "No sports found by multifilter..." });
      else res.status(200).json(sports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  /**
 * @openapi
 * /sports:
 *  post:
 *   summary: Add a new sport to a given location.
 *   description: Add a new **sport** with name and category
 *   tags: [Sports]
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
 *         description: <b>name</b> of comment
 *         example: football
 *        category:
 *         type: array
 *         items:
 *          type: string
 *         description: Categories of the sport
 *         example: ["team", "individual"]
 *       required:
 *        - name
 *        - category
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with sports details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Location'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        locationId is required:
 *         value:
 *          message: Path parameter 'locationId' is required.
 *        author, rating and comment are required:
 *         value:
 *          message: Body parameters 'name'and 'category' are required.
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
 *        message: Not Found in POST sports request.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const sportsCreate = async (req, res) => {
    /*const name = req.body.name;
    let category = req.body.category;*/

    if (typeof req.body.category === 'string' && req.body.category.includes(',')) {
        req.body.category = req.body.category.split(',');
    } else if (!Array.isArray(req.body.category)) {
        req.body.category = [req.body.category];
    }

    var sportToAdd = new Sport({ name: req.body.name, category: req.body.category});

    try {
        let test = await sportToAdd.save();
        res.status(201).json(test); 
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
  };

  module.exports = {
    sportsListAll,
    sportsListByMultiFilter,
    sportsCreate,
  };
