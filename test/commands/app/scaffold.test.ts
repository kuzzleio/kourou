import { execSync } from "child_process";
import fs from "fs";

import should from "should";
import { kourou } from "../../support";

describe("app:scaffold", () => {
  it("should create generic flavor if not specified", () => {
    execSync("rm -rf blackmesa/");

    kourou("app:scaffold blackmesa");

    should(fs.existsSync("./blackmesa/.eslintignore")).be.eql(true);
    should(fs.existsSync("./blackmesa/.eslintrc.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/.gitignore")).be.eql(true);
    should(fs.existsSync("./blackmesa/Dockerfile")).be.eql(true);
    should(fs.existsSync("./blackmesa/docker-compose.yml")).be.eql(true);
    should(fs.existsSync("./blackmesa/app.ts")).be.eql(true);
    should(fs.existsSync("./blackmesa/package.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/README.md")).be.eql(true);
    should(fs.existsSync("./blackmesa/tsconfig.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/jest.config.ts")).be.eql(true);
  }).timeout("60s");

  it("should create generic flavor when specified", () => {
    execSync("rm -rf blackmesa/");

    kourou("app:scaffold blackmesa --flavor generic");

    should(fs.existsSync("./blackmesa/.eslintignore")).be.eql(true);
    should(fs.existsSync("./blackmesa/.eslintrc.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/.gitignore")).be.eql(true);
    should(fs.existsSync("./blackmesa/Dockerfile")).be.eql(true);
    should(fs.existsSync("./blackmesa/docker-compose.yml")).be.eql(true);
    should(fs.existsSync("./blackmesa/app.ts")).be.eql(true);
    should(fs.existsSync("./blackmesa/package.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/README.md")).be.eql(true);
    should(fs.existsSync("./blackmesa/tsconfig.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/jest.config.ts")).be.eql(true);
  }).timeout("60s");

  it("should create iot flavor when specified", () => {
    execSync("rm -rf blackmesa/");

    kourou("app:scaffold blackmesa --flavor iot");

    should(fs.existsSync("./blackmesa/tsconfig.node.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/tsconfig.web.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/.gitignore")).be.eql(true);
    should(fs.existsSync("./blackmesa/docker-compose.yml")).be.eql(true);
    should(fs.existsSync("./blackmesa/package.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/README.md")).be.eql(true);
    should(fs.existsSync("./blackmesa/turbo.json")).be.eql(true);
    should(fs.existsSync("./blackmesa/start.sh")).be.eql(true);
  }).timeout("60s");
});
