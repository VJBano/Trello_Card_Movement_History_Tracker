import fs from "fs";
import path from "path";

const CACHE_FILE = path.resolve("./cache/cache.json");

export const loadCache = () => {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      console.log("Cache loaded from file.");
      return cacheData;
    } catch (err) {
      console.error("Error loading cache file:", err.message);
    }
  }
  console.log("No cache file found. Starting with an empty cache.");
  return {};
};

export const saveCache = (cacheData) => {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log("Cache saved to file.");
  } catch (err) {
    console.error("Error saving cache to file:", err.message);
  }
};
