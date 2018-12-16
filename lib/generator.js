const ejs = require("ejs");
const markdownToPDf = require("markdown-pdf");
const fs = require("fs");
const assert = require("assert");

const START_DATE = "01/01/2019";
const END_DATE = "01/07/2019";
const DEVFEST_EDITION = 2019;

const CONVENTION_FOLDER = "1suRc7f9A2pUQLHPmamqh_DFRYIlSKLrP";
const INVOICE_FOLDER = "1slwgb02jtLWY9rN_D30FJ82q_xbNSqwm";

const [year, month, day] = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
})
  .format(new Date())
  .split("-");
const DATE = `${day}/${month}/${year}`;

const GDG_CONFIGURATION = {
  GDG_CP: process.env.GDG_CP,
  GDG_ADDRESS: process.env.GDG_ADDRESS,
  GDG_CITY: process.env.GDG_CITY
};

function getSponsoringFees(sponsoring) {
  switch (sponsoring) {
    case "CONTRIBUTEUR":
      return ["trois cents euros", 300, 0];
    case "BRONZE":
      return ["mille euros", 1000, 2];
    case "SILVER":
      return ["deux mille cinq cents euros", 2500, 5];
    case "GOLD":
      return ["cinq milles euros", 5000, 8];
  }
}
function generateInvoice(config) {
  const [SPONSORING_TEXT, SPONSORING_NUMBER, NUMBER_PLACE] = getSponsoringFees(
    config.sponsoring
  );
  return new Promise((resolve, reject) => {
    const data = {
      COMPANY: config.company,
      SIRET: config.siret,
      COMPANY_ADDRESS: config.address,
      COMPANY_CP: config.cp,
      COMPANY_CITY: config.city,
      CONTACT: config.contact,
      ROLE: config.role,
      DEVFEST_EDITION,
      NUMBER_PLACE,
      SPONSORING: config.sponsoring,
      SPONSORING_TEXT,
      SPONSORING_NUMBER,
      START_DATE,
      END_DATE,
      DATE,
      ...GDG_CONFIGURATION,
      INVOICE_NUMBER: `${DEVFEST_EDITION}-${Math.floor(
        Math.random() * 1000 + 1
      )}`
    };
    ejs.renderFile("./templates/invoice.template", data, (err, str) => {
      markdownToPDf()
        .from.string(str)
        .to(`./tmp/invoice_${config.company}.pdf`, () => {
          resolve(`invoice_${config.company}.pdf`);
        });
    });
  });
}
function generateConvention(config) {
  const [SPONSORING_TEXT, SPONSORING_NUMBER, NUMBER_PLACE] = getSponsoringFees(
    config.sponsoring
  );
  return new Promise((resolve, reject) => {
    const data = {
      COMPANY: config.company,
      SIRET: config.siret,
      COMPANY_ADDRESS: config.address,
      COMPANY_CP: config.cp,
      COMPANY_CITY: config.city,
      CONTACT: config.contact,
      ROLE: config.role,
      DEVFEST_EDITION,
      NUMBER_PLACE,
      SPONSORING: config.sponsoring,
      SPONSORING_TEXT,
      SPONSORING_NUMBER,
      START_DATE,
      END_DATE,
      DATE,
      ...GDG_CONFIGURATION
    };
    ejs.renderFile("./templates/convention.template", data, (err, str) => {
      markdownToPDf()
        .from.string(str)
        .to(`./tmp/convention_${config.company}.pdf`, () => {
          resolve(`convention_${config.company}.pdf`);
        });
    });
  });
}
function uploadToDrive(paths) {
  console.log("Uploading files");
  const fs = require("fs");
  const readline = require("readline");

  const { google } = require("googleapis");
  const SCOPES = ["https://www.googleapis.com/auth/drive"];
  const TOKEN_PATH = "token.json";

  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), uploadDocuments);
  });

  function uploadDocuments(auth) {
    const drive = google.drive({ version: "v3", auth });

    paths.forEach(path => {
      const fileMetadata = {
        name: path,
        parents: [
          path.indexOf("invoice") === 0 ? INVOICE_FOLDER : CONVENTION_FOLDER
        ]
      };
      const media = {
        mimeType: "image/pdf",
        body: fs.createReadStream(`./tmp/${path}`)
      };
      drive.files.create(
        {
          supportsTeamDrives: "true",
          teamDriveId: "0AMwWAWGc3DTMUk9PVA",
          resource: fileMetadata,
          media: media,
          fields: "id"
        },
        function(err, file) {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            console.log("File Id: ", file.id);
          }
        }
      );
    });
  }
}

module.exports = function(config) {
  [
    "company",
    "address",
    "cp",
    "city",
    "contact",
    "role",
    "siret",
    "sponsoring"
  ].forEach(parameter => {
    assert.ok(
      config[parameter],
      `The ${parameter} parameter should be defined`
    );
  });

  const chalk = require("chalk");
  console.log(chalk.green(`Generate documents with ${JSON.stringify(config)}`));
  return Promise.all([
    generateConvention(config),
    generateInvoice(config)
  ]).then(paths => {
    uploadToDrive(paths);
    return paths;
  });
};
