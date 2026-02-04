const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const envFiles = [".env", ".env.local"];
const cleanPaths = [
  ".next",
  path.join(".netlify", "edge-functions"),
  path.join(".netlify", "functions-internal"),
];

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf8");
  return contents.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      return acc;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

const removePath = (targetPath) => {
  const resolvedPath = path.join(process.cwd(), targetPath);
  if (fs.existsSync(resolvedPath)) {
    fs.rmSync(resolvedPath, { recursive: true, force: true });
  }
};

cleanPaths.forEach(removePath);

const fileEnv = envFiles.reduce((acc, file) => {
  const filePath = path.join(process.cwd(), file);
  return { ...acc, ...readEnvFile(filePath) };
}, {});

const mergedEnv = { ...fileEnv, ...process.env };
const cleanEnv = Object.entries(mergedEnv).reduce((acc, [key, value]) => {
  if (value === undefined || value === null) {
    return acc;
  }

  acc[key] = String(value);
  return acc;
}, {});

const requiredKeys = ["NETLIFY_SITE_ID", "NETLIFY_AUTH_TOKEN"];
const missing = requiredKeys.filter((key) => !cleanEnv[key]);

if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing required Netlify env vars: ${missing.join(", ")}. ` +
      "Add them to .env or set them in your shell."
  );
  process.exit(1);
}

const isProd = process.argv.includes("--prod");
const command = isProd
  ? "npx netlify deploy --build --prod"
  : "npx netlify deploy --build";
const child = spawn(command, { stdio: "inherit", env: cleanEnv, shell: true });

child.on("close", (code) => {
  process.exit(code ?? 1);
});