import { text } from "./http.ts";
export function health(name: string) {
  const sha = Deno.env.get("GIT_COMMIT") || "dev";
  return text(`${name}: ok :: ${sha}`);
}
