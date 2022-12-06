// because I want to host this at https://tadeohepperle.com/dice-calculator-frontend/ we need to use relative paths for linking the js in the index.html

import * as fs from "fs-extra";
// import path from "path";

const directory = "docs";
const subpathname = "dice-calculator-frontend";

async function main() {
  await fs.emptyDir(directory);

  await fs.copy("dist", directory);

  let html = fs.default.readFileSync(`${directory}/index.html`, "utf-8");
  html = html.replaceAll("/assets", `/${subpathname}/assets`);
  fs.default.writeFileSync(`${directory}/index.html`, html, "utf-8");
  console.log("Postbuild modification successful.");
}

main();
