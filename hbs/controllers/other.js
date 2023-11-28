const about = (req, res) => {
  res.render("index", { title: "Information about the application!" });
};

module.exports = {
  about,
};
