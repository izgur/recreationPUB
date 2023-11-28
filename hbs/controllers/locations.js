const events= require("../controllers/events");

const apiServer =
  process.env.NODE_ENV === "production"
    ? "https://lp-izgur-web-service.onrender.com"
    : "https://localhost:" + (process.env.PORT || 3000);
console.log("set apiServer=" + apiServer + "in location controller");

const axios = require("axios").create({ baseURL: apiServer, timeout: 5000 });

const formatDistance = (distance) => {
  let unit = "m";
  let nDigits = 0;
  if (distance > 1000) {
    distance = distance / 1000;
    unit = "km";
    nDigits = 2;
  }
  return (
    distance.toLocaleString("sl-SI", { maximumFractionDigits: nDigits }) +
    " " +
    unit
  );
};

const list = async (req, res) => {
  let location = { lng: 15.649, lat: 46.5568 }; // Ljubljana
  //let location = { lng: 15.260505, lat: 46.231193 }; // Celje
  let data = [];
  let title = "Recreation near your location: ";
  let address;
  try {
    address = (
      await axios.get(
        "https://teaching.lavbic.net/api/nominatim/reverse?lat=" +
          location.lat +
          "&lon=" +
          location.lng +
          "&format=geojson&addressdetails=1&zoom=16"
      )
    ).data.features[0].properties.address;
    if (address.road && address.city)
      title += address.road + ", " + address.city;
    else if (address.city) title += address.city;
    else title += "unknown location";
  } catch (err) {}
  axios
    .get("/api/locations/distance", {
      params: { lng: location.lng, lat: location.lat, nResults: 5 },
    })
    .then(
      (apiRes) =>
        (data = apiRes.data.map((loc) => {
          loc.distance = formatDistance(loc.distance);
          return loc;
        }))
    )
    .catch((err) => (title = err.message + "!"))
    .finally(() => res.render("list", { title, locations: data }));
};

const details = (req, res) => {
  res.render("index", { title: "Details of recreational location" });
};

const addComment = (req, res) => {
  res.render("index", { title: "Add comment!" });
};

module.exports = {
  list,
  details,
  addComment,
};
