import Listr from "listr";

import { execute } from "../execute";
import { Kommand } from "../../common";


const MIN_DOCO_VERSION = "2.0.0";

export async function checkPrerequisites(ctx: Kommand): Promise<boolean> {
  const checks: Listr = new Listr([
    {
      title: `docker compose exists and the version is at least ${MIN_DOCO_VERSION}`,
      task: async () => {
        const docov = await execute("docker", "compose", "version");
        const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/);
        const docoVersion = matches ? matches[1] : null;
        ctx.logInfo(`Found Docker Compose version: ${docoVersion}`);

        if (!docoVersion) {
          throw new Error(
            "Unable to read the version of Docker Compose. Are you sure Docker and the Compose plugin are installed?"
          );
        }


        if (docoVersion < MIN_DOCO_VERSION) {
          throw new Error(
            `Your version of Docker Compose (${docoVersion}) is below the required version (${MIN_DOCO_VERSION}).`
          );
        }
      },
    },
  ]);

  try {
    await checks.run();

    return true;
  } catch (error: any) {
    ctx.logKo(error.message);

    return false;
  }
}