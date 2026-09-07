import _ from "lodash";

const sleep = (seconds: number) =>
  new Promise((resolve: any) => setTimeout(resolve, seconds * 1000));

/**
 * Applies `fn` to every item, `concurrency` at a time, and returns the results
 * in input order. Rejects on the first failure, like `Promise.all`, and stops
 * feeding the workers once that happens.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );

  return results;
}

export async function restoreRoles(
  kommand: any,
  dump: any,
  preserveAnonymous = false,
) {
  if (dump.type !== "roles") {
    throw new Error("Dump file does not contain roles definition");
  }

  const anonymousRights = _.get(
    dump.content,
    "anonymous.controllers.*.actions.*",
  );

  if (!preserveAnonymous && anonymousRights === false) {
    if (kommand.sdk.username === "anonymous") {
      kommand.logKo(
        'You are currently logged in as "anonymous" and anonymous role rights will be overwritten.',
      );
      kommand.logInfo(
        "Use the --preserve-anonymous flag to keep the default anonymous rights.",
      );

      throw new Error(
        "Please authenticate before importing or use --preserve-anonymous.",
      );
    } else {
      kommand.logInfo("Anonymous user rights will be overwritten.");
      kommand.logInfo(
        "Use the --preserve-anonymous flag to keep default anonymous rights.",
      );
      kommand.logInfo("Press CTRL+C to abort or wait 4 sec");

      await sleep(4);
    }
  } else if (preserveAnonymous) {
    kommand.logInfo("Anonymous user rights has been preserved.");

    delete dump.content.anonymous;
  }

  const results = await mapWithConcurrency(
    Object.entries(dump.content),
    ([roleId, role]: any) =>
      kommand.sdk.security.createOrReplaceRole(roleId, role, { force: true }),
    10,
  );

  return results.length;
}

export async function restoreProfiles(kommand: any, dump: any) {
  if (dump.type !== "profiles") {
    throw new Error("Dump file does not contain profiles definition");
  }

  const results = await mapWithConcurrency(
    Object.entries(dump.content),
    ([profileId, profile]: any) =>
      kommand.sdk.security.createOrReplaceProfile(profileId, profile, {
        force: true,
      }),
    10,
  );

  return results.length;
}

export async function restoreUsers(kommand: any, dump: any) {
  if (dump.type !== "users") {
    throw new Error("Dump file does not contain users definition");
  }

  const results = await mapWithConcurrency<[string, any], boolean>(
    Object.entries(dump.content),
    ([userId, userBody]) => {
      return kommand.sdk.security
        .createUser(userId, userBody)
        .then(() => true)
        .catch((error: any) => {
          kommand.logKo(`Error importing user ${userId}: ${error.message}`);
          return false;
        });
    },
    10,
  );

  return results.filter((success) => success).length;
}
