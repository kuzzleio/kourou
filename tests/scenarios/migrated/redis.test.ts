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

    describe("Redis", () => {
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
      it('List matching keys', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
      response = await sdk.query({"controller":"ms","action":"set","_id":"trekking-1","body":{"value":"caner"}});
    
      response = await sdk.query({"controller":"ms","action":"set","_id":"trekking-2","body":{"value":"burak"}});
    
      response = await sdk.query({"controller":"ms","action":"set","_id":"hiking-1","body":{"value":"ozgur"}});
    
        try {
          const { stdout } = await kourou("redis:list-keys", "trekking-*",[]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).toMatch(new RegExp("caner"));
  
      expect(response).toMatch(new RegExp("burak"));
  
      expect(response).not.toMatch(new RegExp("ozgur"));
  });
      
      it('List and delete matching keys', async () => {
        shouldResetSecurity = false;

        let index;
        let collection;
        let document;
        let response;
        
      response = await sdk.query({"controller":"ms","action":"set","_id":"trekking-1","body":{"value":"caner"}});
    
      response = await sdk.query({"controller":"ms","action":"set","_id":"trekking-2","body":{"value":"burak"}});
    
      response = await sdk.query({"controller":"ms","action":"set","_id":"hiking-1","body":{"value":"ozgur"}});
    
        try {
          const { stdout } = await kourou("redis:list-keys", "trekking-*",["--remove"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        try {
          const { stdout } = await kourou("redis:list-keys", "*",[]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      expect(response).not.toMatch(new RegExp("caner"));
  
      expect(response).not.toMatch(new RegExp("burak"));
  
      expect(response).toMatch(new RegExp("ozgur"));
  });
      });
      