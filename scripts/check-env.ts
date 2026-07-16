const required = ["NEXT_PUBLIC_APP_URL"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.warn(`Missing optional local defaults: ${missing.join(", ")}`);
}

console.log("Environment check complete. Local development can run without paid AI services.");

export {};
