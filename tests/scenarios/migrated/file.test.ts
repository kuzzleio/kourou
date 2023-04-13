import { useSdk } from "../../helpers/sdk";
    import { beforeEachTruncateCollections } from "../../hooks/collections";
    import { resetSecurityDefault} from "../../hooks/securities";

    import {Client} from "@elastic/elasticsearch";
    import {execute} from "../../../lib/support/execute";
    import fs from "fs";
    import {exec} from "child_process";

    jest.setTimeout(20000);

    function kourou(...command: any[]) {
      const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
      return execute(kourouRuntime, ...command);
    }

    describe("File", () => {
      let sdk = useSdk();
      let shouldResetSecurity = false;
      let shouldLogout = false;
      let esClient = new Client({ node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" });

      beforeAll(async () => {
        await sdk.connect();
      });

      beforeEach(async () => {
            await beforeEachTruncateCollections(sdk);
      });

      afterEach(async () => {
        if (shouldResetSecurity) {
          await resetSecurityDefault(sdk);
          shouldResetSecurity = false;
        }

        if (shouldLogout) {
          sdk.jwt = null;
        }
      });

      afterAll(async () => {
        sdk.disconnect();
      });
      it('Encrypt and decrypt a file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
       fs.writeFileSync("test-secrets.json", {"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  
        try {
          const { stdout } = await kourou("file:encrypt", "test-secrets.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("file:decrypt", "test-secrets.json.enc",["--output-file","decrypted.json","--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
       expect(JSON.parse(fs.readFileSync("decrypted.json", "utf8"))).toMatchObject({"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  });
      
      it('Test a file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
       fs.writeFileSync("test-secrets.json", {"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  
        try {
          const { stdout } = await kourou("file:encrypt", "test-secrets.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("file:test", "test-secrets.json.enc",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("Encrypted file can be decrypted"));
  });
      });
      