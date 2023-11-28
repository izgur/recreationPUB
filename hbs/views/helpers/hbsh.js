const hbs = require("hbs");

hbs.registerHelper("stars", (rating) => {
  let stars = "";
  for (let i = 1; i <= 5; i++)
    stars +=
      '<i class="fa-' + (rating >= i ? "solid" : "regular") + ' fa-star"></i>';
  return stars;
});
