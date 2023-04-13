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

    describe("ApiKey", () => {
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
      it('Search for API key', async () => {
        shouldResetSecurity = true;

        let index;
        let collection;
        let document;
        let response;
        
      response = await sdk.query({"controller":"security","action":"createApiKey","_id":"gordon-key","userId":"gordon","body":{"description":"Test api key"}});
    
      response = await sdk.query({"controller":"security","action":"createApiKey","_id":"gordon-key-2","userId":"gordon","body":{"description":"Other api key"}});
    
        try {
          const { stdout } = await kourou("api-key:search", "gordon",["--query","\"Test\""]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("gordon-key"));
  
      expect(response).not.toMatch(new RegExp("gordon-key-2"));
  });
      
      it('Checks an API Key validity', async () => {
        shouldResetSecurity = true;

        let index;
        let collection;
        let document;
        let response;
        
       response = await sdk.security.createApiKey(
        "gordon",
        "Test API key"
      );
  
      try {
       const { stdout } = await kourou(
          "api-key:check",
          response.result._source.token
        );
        response = stdout;
      } catch (error) {
        console.error(error);
        throw error;
      }
  
      expect(response).toMatch(new RegExp("API key is still valid"));
  });
      
      it('Use an API Key to connect', async () => {
        shouldResetSecurity = true;

        let index;
        let collection;
        let document;
        let response;
        
       response = await sdk.security.createApiKey(
        "gordon",
        "Test API key"
      );
  
      try {
        const { stdout } = await kourou(
          "api",
          "auth:getCurrentUser",
          "--api-key",
          response.result._source.token
        );
        response = stdout;
        expect(response).toMatch(/"_id": "gordon"/);
      } catch (error) {
        console.error(error);
        throw error;
      }
  });
      });
      