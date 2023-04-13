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

    describe("Import", () => {
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
      it('Generic import of dump files', async () => {
        shouldResetSecurity = true;

        let index;
        let collection;
        let document;
        let response;
        
    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(sdk.collection.exists("nyc-open-data", "yellow-taxi")).resolves.toBe(true);
    collection = "yellow-taxi";
  
      response = await sdk.document["mCreate"](
        index,
        collection,
        [{"_id":"chuon-chuon-kim","body":{"city":"hcmc","district":1}},{"_id":"the-hive","body":{"city":"hcmc","district":2}}]
      );
  
    await sdk.collection.refresh(index, collection);
  
    await sdk.collection.create("nyc-open-data", "green-taxi", { mappings: {} });
    index = "nyc-open-data";
    collection = "green-taxi";
  
      response = await sdk.document["mCreate"](
        index,
        collection,
        [{"_id":"chuon-chuon-kim2","body":{"city":"hcmc","district":1}},{"_id":"the-hive2","body":{"city":"hcmc","district":2}}]
      );
  
    await sdk.collection.refresh(index, collection);
  
        try {
          const { stdout } = await kourou("export:index", "nyc-open-data",["--path","./dump"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      response = await sdk.query({"controller":"index","action":"delete","index":"nyc-open-data"});
    
      response = await sdk.security.createProfile("[object Object]", {"policies":[{"roleId":"default","restrictedTo":[{"index":"nyc-open-data"}]}]});
  
      response = await sdk.security.createProfile("[object Object]", {"policies":[{"roleId":"admin","restrictedTo":[{"index":"mtp-open-data"}]}]});
  
        try {
          const { stdout } = await kourou("export:profile", ["--path","./dump"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
        await sdk.security.deleteProfile("teacher");
    
        await sdk.security.deleteProfile("student");
    
      response = await sdk.security.createRole("teacher",
      {"controllers":{"document":{"actions":{"create":true}}}}
      );
  
      response = await sdk.security.createRole("student",
      {"controllers":{"document":{"actions":{"update":true}}}}
      );
  
        try {
          const { stdout } = await kourou("export:role", ["--path","./dump"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
      await sdk.security.deleteRole("teacher");
  
      await sdk.security.deleteRole("student");
  
        response = await sdk.security.createUser("kleiner", {"content":{"profileIds":["admin"],"email":"kleiner@blackmesa.us"},"credentials":{"local":{"username":"kleiner","password":"password"}}});
  
        response = await sdk.security.createUser("alyx", {"content":{"profileIds":["admin"],"email":"alyx@blackmesa.us"},"credentials":{"local":{"username":"alyx","password":"password"}}});
  
        try {
          const { stdout } = await kourou("export:user", ["--path","./dump","--exclude","gordon","--exclude","test-admin"]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
    response = await sdk.security.deleteUser("kleiner");
  
    response = await sdk.security.deleteUser("alyx");
  
        try {
          const { stdout } = await kourou("import", "./dump",[]);
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  
    await expect(sdk.document.get(index, collection, "chuon-chuon-kim2")).resolves.toMatchObject({ _source: {"city":"hcmc","district":1} });
  
    await expect(sdk.document.get(index, collection, "the-hive2")).resolves.toMatchObject({ _source: {"city":"hcmc","district":2} });
  
    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(sdk.collection.exists("nyc-open-data", "yellow-taxi")).resolves.toBe(true);
    collection = "yellow-taxi";
  
    await expect(sdk.document.get(index, collection, "chuon-chuon-kim")).resolves.toMatchObject({ _source: {"city":"hcmc","district":1} });
  
    await expect(sdk.document.get(index, collection, "the-hive")).resolves.toMatchObject({ _source: {"city":"hcmc","district":2} });
  
      response = await sdk.query({"controller":"collection","action":"getMapping","index":"nyc-open-data","collection":"yellow-taxi"});
    
       expect(response.result["properties"]).toBeDefined()
  
       expect(response.result["properties"]).toMatchObject({"city":{"type":"keyword"},"name":{"type":"keyword"}});
    
   await expect(sdk.security.getRole("teacher").content).resolves.toMatchObject({"document":{"actions":{"create":true}}});
  
   await expect(sdk.security.getRole("student").content).resolves.toMatchObject({"document":{"actions":{"update":true}}});
  
        await expect(sdk.security.getProfile("teacher")).resolves.toMatchObject([{"roleId":"default","restrictedTo":[{"index":"nyc-open-data"}]}]);
  
        await expect(sdk.security.getProfile("student")).resolves.toMatchObject([{"roleId":"admin","restrictedTo":[{"index":"mtp-open-data"}]}]);
  
   await expect(sdk.security.getUser("kleiner").content).resolves.toMatchObject({"profileIds":["admin"],"email":"kleiner@blackmesa.us"});
  
   await expect(sdk.security.getUser("alyx").content).resolves.toMatchObject({"profileIds":["admin"],"email":"alyx@blackmesa.us"});
  });
      });
      