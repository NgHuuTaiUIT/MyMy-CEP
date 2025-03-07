// @include './lib/json2.js'

import { ns } from "../shared/shared";

import * as ppro from "./ppro/ppro";

//@ts-ignore
const host = typeof $ !== "undefined" ? $ : window;

// A safe way to get the app name since some versions of Adobe Apps broken BridgeTalk in various places (e.g. After Effects 24-25)
// in that case we have to do various checks per app to deterimine the app name

const getAppNameSafely = (): ApplicationName | "unknown" => {
  const compare = (a: string, b: string) => {
    return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
  };
  const exists = (a: any) => typeof a !== "undefined";
  const isBridgeTalkWorking =
    typeof BridgeTalk !== "undefined" &&
    typeof BridgeTalk.appName !== "undefined";

  if (isBridgeTalkWorking) {
    return BridgeTalk.appName;
  } else if (app) {
    //@ts-ignore
    if (exists(app.path)) {
      //@ts-ignore
      const path = app.path;
      if (compare(path, "premiere")) return "premierepro";
    }
  }
  return "unknown";
};

switch (getAppNameSafely()) {
  case "premierepro":
  case "premiereprobeta":
    host[ns] = ppro;
    break;
}

export type Scripts = typeof ppro;

// https://extendscript.docsforadobe.dev/interapplication-communication/bridgetalk-class.html?highlight=bridgetalk#appname
type ApplicationName =
  | "premierepro"
  | "premiereprobeta";
