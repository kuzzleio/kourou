import Listr from "listr";

import { execute } from "../execute";
import { Kommand } from "../../common";

export async function checkPrerequisites(ctx: Kommand): Promise<boolean> {
  const checks: Listr = new Listr([
    {
      title: `docker compose exists`,
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