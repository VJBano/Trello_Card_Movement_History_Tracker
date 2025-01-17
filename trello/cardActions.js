import { loadCache, saveCache } from "../cache/cache.js";

import createTrelloAPI from "./config.js";

// get all cards on specific board

const fetchBoardCards = async (client, boardId) => {
  const cache = loadCache();
  const cacheKey = `board-${boardId}-cards`;

  // Check if the cards data for this board exists in the cache and is fresh (within 24 hours)
  if (
    cache[cacheKey] &&
    Date.now() - cache[cacheKey].timestamp < 24 * 60 * 60 * 1000
  ) {
    console.log(`Using cached data for cards of board ${boardId}`);
    return cache[cacheKey].data;
  }

  try {
    // Fetch data from the API if not cached or expired
    const response = await client.get(`/boards/${boardId}/cards`, {
      params: {
        fields: "id,name,idList,dateLastActivity",
      },
    });
    const cards = response.data;

    // Update cache with the new data
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: cards,
    };

    saveCache(cache);

    return cards;
  } catch (error) {
    throw new Error(`Failed to fetch cards: ${error.message}`);
  }
};

//get card actions
const fetchCardActions = async (client, cardId) => {
  const cache = loadCache();
  const cacheKey = `card-${cardId}-actions`;

  // Check if the actions data for this card exists in the cache and is fresh (within 24 hours)
  if (
    cache[cacheKey] &&
    Date.now() - cache[cacheKey].timestamp < 24 * 60 * 60 * 1000
  ) {
    console.log(`Using cached data for actions of card ${cardId}`);
    return cache[cacheKey].data; // Return cached data
  }

  try {
    // Fetch data from the API if not cached or expired
    const response = await client.get(`/cards/${cardId}/actions`, {
      params: {
        filter: "updateCard,createCard,moveCardToBoard",
        fields: "data,date,type",
        limit: 1000,
      },
    });
    const actions = response.data;

    // Update cache with the new data
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: actions,
    };

    saveCache(cache);

    return actions;
  } catch (error) {
    throw new Error(`Failed to fetch card actions: ${error.message}`);
  }
};

// Parse actions to get movement events
const parseMovementEvents = (actions) => {
  return actions
    .filter((action) => {
      const { type, data } = action;
      // Only include relevant movement events
      return (
        (type === "updateCard" && (data.listBefore || data.boardBefore)) ||
        type === "createCard" ||
        type === "moveCardToBoard"
      );
    })
    .map((action) => {
      const { type, data, date } = action;
      let from = "";
      let to = "";

      if (type === "createCard") {
        from = "Created";
        to = `${data.board.name} / ${data.list.name}`;
      } else if (type === "moveCardToBoard") {
        from = `${data.boardSource.name}`;
        to = `${data.board.name} / ${data.list.name}`;
      } else {
        const oldBoard = data.boardBefore
          ? data.boardBefore.name
          : data.board.name;
        const oldList = data.listBefore ? data.listBefore.name : data.list.name;
        const newBoard = data.boardAfter
          ? data.boardAfter.name
          : data.board.name;
        const newList = data.listAfter ? data.listAfter.name : data.list.name;

        from = `${oldBoard} / ${oldList}`;
        to = `${newBoard} / ${newList}`;
      }

      return {
        timestamp: new Date(date),
        from,
        to,
        type,
      };
    });
};

// Main function to get all card movements for a board
const getCardMovements = async (apiKey, token, boardId) => {
  const client = createTrelloAPI(apiKey, token);
  const movements = [];

  try {
    // Fetch all cards from the board
    const cards = await fetchBoardCards(client, boardId);
    console.log(`Found ${cards.length} cards on board`);

    // Process each card
    for (const card of cards) {
      console.log(`Processing card: ${card.name}`);
      const actions = await fetchCardActions(client, card.id);
      const cardMovements = parseMovementEvents(actions);

      // Add card info to movements
      cardMovements.forEach((movement) => {
        movements.push({
          cardId: card.id,
          cardName: card.name,
          ...movement,
        });
      });
    }

    //sort by timestamp
    return movements.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching card movements:", error.message);
    throw error;
  }
};

export default getCardMovements;
