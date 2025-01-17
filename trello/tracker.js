import createTrelloAPI from "./config.js";
import { getBoards } from "./board.js";
import ActionsAPI from "./actions.js";
import generateCSV from "../csv/csv_generator.js";
import generateGoogleSheet from "../google/generateGoogleSheet.js";

// Main execution function
const trackCardMovements = async (apiKey, token, outputPath) => {
  const client = createTrelloAPI(apiKey, token);

  try {
    // Get all boards
    const boards = await getBoards(client);

    // Fetch and process actions for each board
    const allMovements = await Promise.all(
      boards.map(async (board) => {
        console.log(`Process board: ${board.name}`);
        const actions = await ActionsAPI.getBoardActions(client, board.id);
        return ActionsAPI.processActions(actions);
      })
    ).then((movements) => movements.flat());

    // Sort movements by timestamp
    const sortedMovements = allMovements.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Generate CSV file
    await generateCSV(sortedMovements, outputPath);

    //Generate to google sheet
    await generateGoogleSheet(sortedMovements, outputPath);

    return sortedMovements;
  } catch (error) {
    console.error("Error tracking card movements:", error.message);
    throw error;
  }
};

export default trackCardMovements;
