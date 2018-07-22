const inquirer = require("inquirer");
const figlet = require("figlet");

figlet("Sponsoring Generator", function(err, data) {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Name of the company",
        name: "company"
      },
      {
        type: "input",
        message: "address",
        name: "address"
      },
      {
        type: "input",
        message: "postal code",
        name: "cp"
      },
      {
        type: "input",
        message: "city",
        name: "city"
      },
      {
        type: "input",
        message: "Contact in the company",
        name: "contact"
      },
      {
        type: "input",
        message: "Role of this contact",
        name: "role"
      },
      {
        type: "input",
        message: "SIRET of the company",
        name: "siret"
      },
      {
        type: "list",
        message: "sponsoring",
        name: "sponsoring",
        choices: ["gold", "silver", "bronze"]
      }
    ])
    .then(answers => {
      require("./lib/generator")(answers);
    });
});
