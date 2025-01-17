import { loadCache, saveCache } from "../cache/cache.js";

const ActionsAPI = {
  getBoardActions: async (client, boardId) => {
    const cache = loadCache(); // Load cache at the start

    // Check if the boardId data exists in the cache and is fresh (within 24 hours)
    if (
      cache[boardId] &&
      Date.now() - cache[boardId].timestamp < 24 * 60 * 60 * 1000
    ) {
      console.log(`Using cached data for board ${boardId}`);
      return cache[boardId].data; // Return cached data
    }

    try {
      // Fetch data from API if not cached or expired
      const response = await client.get(`/boards/${boardId}/actions`, {
        params: {
          filter: "updateCard,createCard,moveCardToBoard",
          limit: 1000,
        },
      });

      const actions = response.data;

      // Update cache with new data
      cache[boardId] = {
        timestamp: Date.now(),
        data: actions,
      };
      saveCache(cache); // Persist updated cache to file

      return actions;
    } catch (error) {
      console.error(
        `Error fetching actions for board ${boardId}:`,
        error.message
      );
      throw error;
    }
  },

  // Process actions into movement records
  processActions: async (actions) => {
    return actions
      .filter((action) => {
        const type = action.type;
        const data = action.data;
        return (
          (type === "updateCard" && (data.listBefore || data.boardBefore)) ||
          type === "createCard" ||
          type === "moveCardToBoard"
        );
      })
      .map((action) => {
        const data = action.data;
        let oldLocation = "";
        let newLocation = "";

        if (action.type === "createCard") {
          oldLocation = "Created";
          newLocation = `${data.board.name} / ${data.list.name}`;
        } else if (action.type === "moveCardToBoard") {
          oldLocation = data.boardSource.name;
          newLocation = `${data.board.name} / ${data.list.name}`;
        } else {
          const oldBoard = data.boardBefore
            ? data.boardBefore.name
            : data.board.name;
          const oldList = data.listBefore
            ? data.listBefore.name
            : data.list.name;
          const newBoard = data.boardAfter
            ? data.boardAfter.name
            : data.board.name;
          const newList = data.listAfter ? data.listAfter.name : data.list.name;

          oldLocation = `${oldBoard} / ${oldList}`;
          newLocation = `${newBoard} / ${newList}`;
        }

        return {
          cardName: data.card.name,
          oldLocation,
          newLocation,
          timestamp: new Date(action.date).toISOString(),
        };
      });
  },
};

export default ActionsAPI;
