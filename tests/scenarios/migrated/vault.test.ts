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

    describe("Vault", () => {
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
      it('Encrypt a secrets file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
       fs.writeFileSync("test-secrets.json", {"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  
        try {
          const { stdout } = await kourou("vault:encrypt", "test-secrets.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("vault:show", "test-secrets.enc.json","aws.s3",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("foobar"));
  
        try {
          const { stdout } = await kourou("vault:show", "test-secrets.enc.json","my.huong",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("hcmc"));
  });
      
      it('Add a key to an encrypted secrets file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
        try {
          const { stdout } = await kourou("vault:add", "test-secrets.enc.json","aws.s4","barfoo",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("vault:add", "test-secrets.enc.json","aws.s3","foobar",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("vault:show", "test-secrets.enc.json","aws.s4",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("barfoo"));
  
        try {
          const { stdout } = await kourou("vault:show", "test-secrets.enc.json","aws.s3",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("foobar"));
  });
      
      it('Test a secrets file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
       fs.writeFileSync("test-secrets.json", {"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  
        try {
          const { stdout } = await kourou("vault:encrypt", "test-secrets.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("vault:test", "test-secrets.enc.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("Secrets file can be decrypted"));
  });
      
      it('Decrypt a secrets file', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
       fs.writeFileSync("test-secrets.json", {"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  
        try {
          const { stdout } = await kourou("vault:encrypt", "test-secrets.json",["--vault-key","secret-password"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("vault:decrypt", "test-secrets.enc.json",["--vault-key","secret-password","--output-file","decrypted.json"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
       expect(JSON.parse(fs.readFileSync("decrypted.json", "utf8"))).toMatchObject({"aws":{"s3":"foobar"},"my":{"huong":"hcmc"}});
  });
      });
      