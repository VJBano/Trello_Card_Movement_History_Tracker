import dotenv from "dotenv";
import trackCardMovements from "./trello/tracker.js";
import getCardMovements from "./trello/cardActions.js";
dotenv.config();

// Ensure environment variables are set
const apiKey = process.env.API_KEY;
const apiToken = process.env.API_TOKEN;
const boardId = process.env.BOARD_ID;

// fetch all cards and their action history from a specific Trello board
const cardRunner = async (board_id, apiKey, apiToken) => {
  const boardId = process.argv[2] ? process.argv[2] : board_id;

  if (!boardId) {
    console.error("\nError: No board ID provided");
    console.log("\nUsage:");
    console.log("node index <boardId>");
    console.log("OR");
    console.log("Set BOARD_ID in your .env file");
    process.exit(1);
  }

  if (!apiKey || !apiToken) {
    console.error("Please set API_KEY and API_TOKEN environment variables");
    process.exit(1);
  }

  try {
    const movements = await getCardMovements(apiKey, apiToken, boardId);

    console.log("\nCard Movements:");
    movements.forEach((movement) => {
      console.log("\n---");
      console.log(`Card: ${movement.cardName}`);
      console.log(`From: ${movement.from}`);
      console.log(`To: ${movement.to}`);
      console.log(`Date: ${movement.timestamp.toLocaleString()}`);
      console.log(`Type: ${movement.type}`);
    });

    console.log(`\nTotal movements found: ${movements.length}`);
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }
};

//main execute functiom
const mainRunner = async () => {
  if (!apiKey || !apiToken) {
    console.error("Please set API_KEY and API_TOKEN environment variables");
    process.exit(1);
  }

  try {
    await trackCardMovements(apiKey, apiToken, "card_movements.csv");
    console.log("Card movement tracking successfully");
  } catch (error) {
    console.error("Failed to track card movements:", error.message);
    process.exit(1);
  }
};
cardRunner(boardId, apiKey, apiToken);
mainRunner();
