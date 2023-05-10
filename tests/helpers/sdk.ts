import { Kuzzle, WebSocket } from "kuzzle-sdk";
import {execute} from "../../lib/support/execute";

export function useSdk(): Kuzzle {
  return new Kuzzle(new WebSocket("localhost", { port: 7512 }));
}

