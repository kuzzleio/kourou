import { execSync } from "child_process";
import {kourou} from "../../support";
import {expectFilesExists} from "../../expect";

describe("app:scaffold", () => {

  afterEach(() => {
    execSync("rm -rf blackmesa/");
  });

  it("creates desired files and install packages", async () => {
    kourou("app:scaffold blackmesa");

    expectFilesExists([
      "./blackmesa/.eslintignore",
      "./blackmesa/.eslintrc.json",
      "./blackmesa/.gitignore",
      "./blackmesa/.mocharc.json",
      "./blackmesa/app.ts",
      "./blackmesa/package.json",
      "./blackmesa/README.md",
      "./blackmesa/tsconfig.json"
    ]);
  })
});
