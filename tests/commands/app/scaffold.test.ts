import { execSync } from "child_process";
import fs from "fs";
import {kourou} from "../../support";

describe("app:scaffold", () => {
  it("creates desired files and install packages", () => {
    execSync("rm -rf blackmesa/");

    kourou("app:scaffold blackmesa");

    expect(fs.existsSync("./blackmesa/.eslintignore")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/.eslintrc.json")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/.gitignore")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/.mocharc.json")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/app.ts")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/package.json")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/README.md")).toBeTruthy();
    expect(fs.existsSync("./blackmesa/tsconfig.json")).toBeTruthy();
  })
});
