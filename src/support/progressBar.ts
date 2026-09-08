import { SingleBar, Options } from "cli-progress";

/**
 * Creates a progress bar behaving like the one cli-ux used to provide.
 *
 * cli-ux wrapped cli-progress and forced `noTTYOutput` whenever the terminal
 * is dumb or stdin is not a TTY, which is what keeps the output readable when
 * it is piped or captured, as the functional tests do. Reproduced here so the
 * output stays identical now that cli-ux is gone.
 */
export function createProgressBar(options: Options = {}): SingleBar {
  return new SingleBar({
    ...options,
    noTTYOutput: Boolean(process.env.TERM === "dumb" || !process.stdin.isTTY),
  });
}
