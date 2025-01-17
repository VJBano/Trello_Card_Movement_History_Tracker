import createTrelloAPI from "../trello/config.js";
import { getBoards } from "../trello/board.js";

export const testAuth = async (apiKey, token) => {
  const client = createTrelloAPI(apiKey, token);
  return await getBoards(client);
};
