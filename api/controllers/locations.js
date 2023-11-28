const mongoose = require("mongoose");
const Location = mongoose.model("Location");

const allowedCodelists = [
  "category",
  "sports"
];

/**
 * @openapi
 *  /locations/all:
 *   get:
 *    summary: Retrieve all locations ...
 *    description: Retrieve all options for recreation.
 *    tags: [Locations]
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
 *      description: <b>OK</b>, with list of locations.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Location'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Maribor High School
 *           category: individial, pairs, team
 *           type: indoor, outdoor, water 
 *           sports: football, basketball
 *           description: Located in Maribor, known for producing talented musicians and artists
 *           location: Glasbena šola sredi Maribora.
 *           coordinates: [14.4765778196, 46.0557820208]
 *           author: igorzgur
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
 *         message: "No locations found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const locationsListAll = async (req, res) => {
  console.log("in locationsListAll");
  let nResults = parseInt(req.query.nResults);
  nResults = isNaN(nResults) ? 10 : nResults;
  try {
    let locations = await Location.aggregate([{ $limit: nResults }]);
    if (!locations || locations.length == 0)
      res.status(404).json({ message: "locationsListAll - No locations found." });
    else res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};

/**
 * @openapi
 *  /locations/distance:
 *   get:
 *    summary: Retrieve locations within a given distance.
 *    description: Retrieve **recreations within a given distance** from a given location.
 *    tags: [Locations]
 *    parameters:
 *     - name: lat
 *       in: query
 *       required: true
 *       description: <b>latitude</b> of the location
 *       schema:
 *        type: number
 *        minimum: -180
 *        maximum: 180
 *       example: 46.5568
 *     - name: lng
 *       in: query
 *       required: true
 *       description: <b>longitude</b> of the location
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
 *      description: <b>OK</b>, with list of locations.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Location'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: First Gimnasium Maribor
 *           category: individial, pairs, team
 *           type: indoor, outdoor, water 
 *           sports: football
 *           description: Zelo velika telovadnica
 *           location: V ližini centra.
 *           coordinates: [14.4765778196, 46.0557820208]
 *           author: igorzgur
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
 *         message: "No locations found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const locationsListByDistance = async (req, res) => {
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
      let locations = await Location.aggregate([
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
      if (!locations || locations.length == 0)
        res.status(404).json({ message: "No locations found." });
      else res.status(200).json(locations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /locations/search:
 *   get:
 *    summary: Retrieve locations filtered by codelist values.
 *    description: Retrieve **recreations limited with** selected **codelist's values**.
 *    tags: [Locations]
 *    parameters:
 *     - name: category
 *       in: query
 *       description: <b>category</b> of the location
 *       schema:
 *        type: string
 *        enum:
 *         - individual
 *         - pairs
 *         - team
 *     - name: type
 *       in: query
 *       description: <b>type</b> of the location
 *       schema:
 *        type: string
 *        enum:
 *         - indoor
 *         - outdoor
 *         - water
 *     - name: sports
 *       in: query
 *       description: <b>sports</b> of the location
 *       schema:
 *        type: string
 *        enum:
 *         - football
 *         - baseball
 *         - supping 
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
 *         $ref: '#/components/schemas/Location'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Ljubljana - Cankarjeva spominska soba na Rožniku
 *           category: team
 *           type: outdoor
 *           sports: spominska soba
 *           description: Spominska soba, posvečena Ivanu Cankarju, je bila urejena leta 1948 in prenovljena v letih 1965 in 1998. Pisatelj je na Rožniku živel v letih 1910 - 1917, muzejsko postavitev je pripravil Mestni muzej Ljubljana.
 *           location: Spominska soba je urejena v stavbi, ki stoji nasproti gostilne Rožnik, na Cankarjevem vrhu (Rožnik).
 *           coordinates: [14.4765778196, 46.0557820208]
 *           author: igorzgur
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No locations found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const locationsListByMultiFilter = async (req, res) => {
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
    let locations = await Location.aggregate(filter).exec();
    if (!locations || locations.length === 0)
      res.status(404).json({ message: "No recreation locations found." });
    else res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /locations/{locationId}:
 *   get:
 *    summary: Retrieve details of a given location.
 *    description: Retrieve **recreation possibility details** for a given location.
 *    tags: [Locations]
 *    parameters:
 *    - name: locationId
 *      in: path
 *      required: true
 *      description: <b>unique identifier</b> of location
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      example: 65140319dae53b4c4262d52b
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with location details.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Location'
 *        example:
 *         _id: 65140319dae53b4c4262d52b
 *         name: School I
 *         category: individual, pairs, team
 *         type: indoor, outdoor, water
 *         sports: [football, basketball, baseball, supping]
 *         description: Muzej na prostem sestavljajo skupina 17 kozolcev različnih tipov in dve enostavni sušilni napravi (belokranjska ostrv in ribniški kozouček). Postavitev iz 2012 prikazuje genezo kozolca na Slovenskem in raznolikost kozolcev v Mirnski dolini.
 *         location: Muzej na prostem je urejen na južnem obrobju Šentruperta na Dolenjskem.
 *         coordinates: [15.0914351743,45.9748324693]
 *         comments: []
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Location with id '735a62f5dc5d7968e68464c1' not found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Cast to ObjectId failed for value \"1\" (type string) at path \"_id\" for model \"Location\""
 */
const locationsReadOne = async (req, res) => {
  try {
    let location = await Location.findById(req.params.locationId)
      .select("-id")
      .exec();
    if (!location)
      res.status(404).json({
        message: `Location with id '${req.params.locationId}' not found`,
      });
    else res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /locations/codelist/{codelist}:
 *  get:
 *   summary: Retrieve codelist values.
 *   description: Allowed **codelist values** for given codelist name.
 *   tags: [Locations]
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
const locationsListCodelist = async (req, res) => {
  let codelist = req.params.codelist;
  if (!allowedCodelists.includes(codelist))
    res.status(400).json({
      message: `Parameter 'codelist' must be one of: ${allowedCodelists.join(
        ", "
      )}`,
    });
  else {
    try {
      let codeListValues = await Location.distinct(codelist).exec();
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

module.exports = {
  locationsListAll,
  locationsListByDistance,
  locationsListByMultiFilter,
  locationsListCodelist,
  locationsReadOne,
};
