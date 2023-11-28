const apiServer =
  process.env.NODE_ENV === "production"
    ? "https://lp-izgur-web-service.onrender.com"
    : "https://localhost:" + (process.env.PORT || 3000);
console.log("set apiServer=" + apiServer + "in events controller");

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

const eventList = async (req, res) => {
  let location = { lng: 15.649, lat: 46.5568 }; // Ljubljana
  //let location = { lng: 15.260505, lat: 46.231193 }; // Celje
  let data = [];
  let title = "Events near your location: ";
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
    .get("/api/events/distance", {
      params: { lng: location.lng, lat: location.lat, nResults: 5 },
    })
    .then(
      (apiRes) =>
        (data = apiRes.data.map((event) => {
          event.distance = formatDistance(event.distance);
          return event;
        }))
    )
    .catch((err) => (title = err.message + "!"))
    .finally(() => res.render("list", { title, events: data }));
};

const details = (req, res) => {
  res.render("index", { title: "Details of event!" });
};

const addEventComment = (req, res) => {
  res.render("index", { title: "Add event comment!" });
};

module.exports = {
  eventList,
  details,
  addEventComment,
};
