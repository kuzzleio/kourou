import { execSync } from "child_process";
import fs from "fs";

import should from "should";
import { kourou } from "../../support";

describe("app:scaffold", () => {
  it("creates desired files and install packages", () => {
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
});
