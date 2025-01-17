import fs from "fs";
import path from "path";
import { loadCache, saveCache } from "../cache/cache.js";

jest.mock("fs");

describe("Cache functions", () => {
  const CACHE_FILE = path.resolve("./cache/cache.json");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadCache", () => {
    it("loads the cache data from the file", () => {
      const mockCacheData = { key: "value" };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockCacheData));

      // Act: Call loadCache
      const cache = loadCache();

      // Assert: Check that the correct data was returned
      expect(cache).toEqual(mockCacheData);
      expect(fs.existsSync).toHaveBeenCalledWith(CACHE_FILE);
      expect(fs.readFileSync).toHaveBeenCalledWith(CACHE_FILE, "utf-8");
    });

    it("handles errors when reading the cache file", () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error("Error reading file");
      });

      // Act: Call loadCache
      const cache = loadCache();

      // Assert: Ensure that an empty object is returned when an error occurs
      expect(cache).toEqual({});
      expect(fs.existsSync).toHaveBeenCalledWith(CACHE_FILE);
      expect(fs.readFileSync).toHaveBeenCalledWith(CACHE_FILE, "utf-8");
    });

    it("returns an empty cache when the file does not exist", () => {
      // Arrange: Mock fs.existsSync to return false (file doesn't exist)
      fs.existsSync.mockReturnValue(false);

      // Act: Call loadCache
      const cache = loadCache();

      // Assert: Ensure that an empty object is returned
      expect(cache).toEqual({});
      expect(fs.existsSync).toHaveBeenCalledWith(CACHE_FILE);
    });
  });

  describe("saveCache", () => {
    it("saves the cache data to the file", () => {
      const mockCacheData = { key: "value" };
      fs.writeFileSync.mockImplementation(() => {});

      // Act: Call saveCache
      saveCache(mockCacheData);

      // Assert: Ensure that writeFileSync is called with the correct data
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CACHE_FILE,
        JSON.stringify(mockCacheData, null, 2)
      );
    });

    it("handles errors when saving the cache", () => {
      const mockCacheData = { key: "value" };
      fs.writeFileSync.mockImplementation(() => {
        throw new Error("Error saving file");
      });

      // Act: Call saveCache
      saveCache(mockCacheData);

      // Assert: Ensure the error was caught and logged
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CACHE_FILE,
        JSON.stringify(mockCacheData, null, 2)
      );
    });
  });
});
