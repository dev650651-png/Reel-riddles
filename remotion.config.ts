/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { execSync } from "node:child_process";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Remotion cannot download its own browser in this cloud session,
// so use the pre-installed one (tools/find_browser). CLI --browser-executable still overrides.
try {
  const browser = execSync("bash tools/find_browser", { encoding: "utf8" }).trim();
  if (browser) Config.setBrowserExecutable(browser);
} catch {
  // fall back to Remotion's default browser download
}
