/**
 * Functional tests
 */
(async function Demo() {
  /**
   * Libraries
   */
  const { execSync } = require("child_process");
  const { describe, it, after, before } = require("mocha");
  const { Builder, By } = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  const expect = require("chai").expect;
  const https = require("https");
  /**
   * Parameters
   */
  let applicationUrl = "https://host.docker.internal:3000/";
  let seleniumServerUrl = "http://127.0.0.1:4445/wd/hub";
  let browser, jwtToken;
  const axios = require("axios").create({
    baseURL: applicationUrl + "api/",
    timeout: 5000,
  });
  /**
   * Error handling
   */
  process.on("unhandledRejection", (error) => console.log(error));
  /**
   * Confirm the exception for the self-signed certificate
   */
  let confirmHttpsException = async (browser) => {
    let button = await browser.findElement(
      By.xpath("//button[contains(text(), 'Advanced')]")
    );
    expect(button).to.not.be.empty;
    await button.click();
    let link = await browser.findElement(
      By.xpath("//a[contains(text(), 'Proceed to')]")
    );
    expect(link).to.not.be.empty;
    await link.click();
  };
  try {
    before(async () => {
      browser = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(
          new chrome.Options()
            .addArguments("start-maximized")
            .addArguments("disable-infobars")
            .addArguments("allow-insecure-localhost")
            .addArguments("allow-running-insecure-content")
        )
        .usingServer(seleniumServerUrl)
        .build();
      await browser.manage().setTimeouts({ implicit: 30 * 1000 });
    });
    describe("Location list", () => {
      before(async () => {
        await browser.get(applicationUrl);
        await confirmHttpsException(browser);
      });

      it("number of locations on the home page", async () => {
        let locations = await browser.findElements(By.css(".card"));
        expect(locations).to.be.an("array").to.have.lengthOf(10);
      });
    });
    describe("About application", () => {
      before(async () => await browser.get(applicationUrl));
      it("select about application", async () => {
        let link = await browser.findElement(
          By.xpath("//a[contains(text(), 'Information')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
        link = await browser.findElement(
          By.xpath("//a[contains(text(), 'About application')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
      });
      context("accuracy of data on the about application page", () => {
        it("page title", async () => {
          let title = await browser.findElement(By.css("h1"));
          expect(title).to.not.be.empty;
          expect(await title.getText()).to.be.equal("About");
        });
        it("page text", async () => {
          let text = await browser.findElement(
            By.xpath("//p[contains(text(), 'boredom is still a part of life')]")
          );
          expect(text).to.not.be.empty;
          expect(await text.getText()).to.have.string(
            "Even though we have more activities and information serving our days than ever before – work, family, friends, travel, the internet, books, movies – boredom is still a part of life."
          );
        });
      });
    });
    describe("Location details", () => {
      before(() => browser.get(applicationUrl));
      it("select Ljubljana - Viško pokopališče", async () => {
        let link = await browser.findElement(
          By.xpath("//a[contains(text(), 'Ljubljana - Viško pokopališče')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
      });
      context("accuray of data on the location details page", () => {
        it("location title", async () => {
          let title = await browser.findElement(By.css("h1"));
          expect(title).to.not.be.empty;
          expect(await title.getText()).to.be.equal(
            "Ljubljana - Viško pokopališče"
          );
        });
        it("location properties", async () => {
          let secondKeyword = await browser.findElement(
            By.xpath("//h6[text()='Keywords']/following-sibling::p/span[2]")
          );
          expect(secondKeyword).to.not.be.empty;
          expect(await secondKeyword.getText()).to.be.equal("portal");
        });
        it("location sidebar", async () => {
          let sidebar = await browser.findElement(
            By.xpath("//app-sidebar/small")
          );
          expect(sidebar).to.not.be.empty;
          expect(await sidebar.getText()).to.have.string(
            "Ljubljana - Viško pokopališče is on our Demo app"
          );
        });
      });
    });
    describe("Register new user", () => {
      before(async () => await browser.get(applicationUrl));
      it("delete user from database", async () => {
        let dockerDeleteUser =
          'docker exec -i sp-mongo-db bash -c "mongosh Demo --eval \'db.Users.deleteOne({ email: \\"janez@kranjski.net\\" })\'"';
        let result = execSync(dockerDeleteUser).toString();
        expect(result).to.match(/acknowledged: true/);
      });
      it("user login", async () => {
        let link = await browser.findElement(
          By.xpath("//a[contains(text(), 'Guest')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
        link = await browser.findElement(
          By.xpath("//a[contains(text(), 'Login')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
      });
      it("select register", async () => {
        let link = await browser.findElement(
          By.xpath("//a[contains(text(), 'register')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
      });
      it("user data entry", async () => {
        let name = await browser.findElement(By.css("input[name='name']"));
        expect(name).to.not.be.empty;
        name.sendKeys("Janez Kranjski");
        let email = await browser.findElement(By.css("input[name='email']"));
        expect(email).to.not.be.empty;
        email.sendKeys("janez@kranjski.net");
        let password = await browser.findElement(
          By.css("input[name='password']")
        );
        expect(password).to.not.be.empty;
        password.sendKeys("test");
        let button = await browser.findElement(
          By.xpath("//button[contains(text(), 'Register')]")
        );
        await button.click();
      });
      it("check if user is logged in", async () => {
        let user = await browser.findElement(
          By.xpath("//a[contains(text(), 'Janez Kranjski')]")
        );
        expect(user).to.not.be.empty;
      });
      it("get JWT token", async () => {
        jwtToken = await browser.executeScript(() =>
          localStorage.getItem("demo-token")
        );
        expect(jwtToken).to.not.be.empty;
      });
    });
    describe("Add comment", async () => {
      before(async () => await browser.get(applicationUrl));
      it("select Ljubljana - Viško pokopališče", async () => {
        let link = await browser.findElement(
          By.xpath("//a[contains(text(), 'Ljubljana - Viško pokopališče')]")
        );
        expect(link).to.not.be.empty;
        await link.click();
      });
      it("check if Ljubljana - Viško pokopališče page is displayed", async () => {
        let title = await browser.findElement(
          By.xpath("//h1[contains(text(), 'Ljubljana - Viško pokopališče')]")
        );
        expect(title).to.not.be.empty;
        expect(await title.getText()).to.be.equal(
          "Ljubljana - Viško pokopališče"
        );
      });
      it("click the button to add a comment", async () => {
        await browser.executeScript(
          "window.scrollBy(0,document.body.scrollHeight)"
        );
        await browser.executeScript("document.querySelector('a.btn').click()");
        let modal = await browser.findElement(
          By.xpath("//h4[contains(@class,'modal-title')]")
        );
        expect(modal).to.not.be.empty;
        let rating = await browser.findElement(By.xpath("//span[@title=3]"));
        await rating.click();
        await browser
          .findElement(By.css("textarea[id='comment']"))
          .sendKeys("Najbolj so mi všeč igrala.");
        button = await browser.findElement(
          By.xpath("//button[contains(., 'Save')]")
        );
        await button.click();
      });
      it("check if the comment has been added", async () => {
        execSync('sleep 1');
        let lastComment = await browser.findElement(
          By.xpath(
            "//div[contains(@class, 'card-header') and contains(., 'comments')]/../div[@class='card-body']/div[1]"
          )
        );
        expect(lastComment).to.not.be.empty;
        let author = await lastComment.findElement(
          By.xpath("./div[1]/div[1]")
        );
        expect(author).to.not.be.empty;
        expect(await author.getText()).to.be.equal("Janez Kranjski");
        let comment = await lastComment.findElement(By.xpath("./div[2]"));
        expect(comment).to.not.be.empty;
        expect(await comment.getText()).to.be.equal(
          "Najbolj so mi všeč igrala."
        );
      });
      it("delete user's comments", async function () {
        let link = await browser.getCurrentUrl();
        let locationId = link.split("locations/")[1];
        expect(locationId).to.not.be.empty;
        let location = await axios({
          method: "get",
          url: "locations/" + locationId,
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });
        let comments = (await location.data.comments)
          .filter((x) => {
            return x.author == "Janez Kranjski";
          })
          .map((x) => x._id);
        for (const commentId of comments) {
          let response = await axios({
            method: "delete",
            url: "locations/" + locationId + "/comments/" + commentId,
            headers: { Authorization: "Bearer " + jwtToken },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          });
          expect(response.status).to.be.equal(204);
        }
        await browser.get(applicationUrl);
      });
    });
    describe("User logout", async () => {
      before(() => browser.get(applicationUrl));
      it("check if the user is logged in", async () => {
        let user = await browser.findElement(
          By.xpath("//a[contains(text(), 'Janez Kranjski')]")
        );
        expect(user).to.not.be.empty;
      });
      it("request logout", async () => {
        let user = await browser.findElement(
          By.xpath("//a[contains(text(), 'Janez Kranjski')]")
        );
        expect(user).to.not.be.empty;
        await user.click();
        let logout = await browser.findElement(
          By.xpath("//a[contains(text(), 'Logout')]")
        );
        expect(logout).to.not.be.empty;
        await logout.click();
      });
      it("check if the user is logged out", async () => {
        let login = await browser.findElement(
          By.xpath("//a[contains(text(), 'Login')]")
        );
        expect(login).to.not.be.empty;
      });
    });
    after(async () => {
      browser.quit();
    });
  } catch (error) {
    console.log("An error occurred during the test!");
    console.log(error);
  }
})();