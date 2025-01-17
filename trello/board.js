import { loadCache, saveCache } from "../cache/cache.js";

export const getBoards = async (client) => {
  const cache = loadCache();
  const cacheKey = "boards";

  // Check if the boards data exists in the cache and is fresh (within 24 hours)
  if (
    cache[cacheKey] &&
    Date.now() - cache[cacheKey].timestamp < 24 * 60 * 60 * 1000
  ) {
    console.log("Using cached data for boards.");
    return cache[cacheKey].data; // Return cached data
  }

  try {
    // Fetch data from the API if not cached or expired
    const response = await client.get("/members/me/boards");
    const boards = response.data;

    // Update cache with the new data
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: boards,
    };

    saveCache(cache);

    return boards;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(
        "Authentication failed. Please check your API key and token."
      );
    }
    throw new Error(`Failed to fetch boards: ${error.message}`);
  }
};
