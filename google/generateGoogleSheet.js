import { google } from "googleapis";
import dotenv from "dotenv";
import { checkForDuplicates } from "../csv/csv_generator.js";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT_KEY_PATH = "./google/tokenoftrust-11486f345aeb.json";

const authenticateGoogleSheets = () => {
  return google.auth.getClient({
    keyFile: SERVICE_ACCOUNT_KEY_PATH,
    scopes: SCOPES,
  });
};

const checkAndAddHeaders = async (sheets, spreadsheetId) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:Z1",
    });

    // If the first row is empty, add the headers
    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        [
          "Card Name",
          "Old Board/List Name",
          "New Board/List Name",
          "Timestamp of Movement",
        ],
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        resource: { values: headers },
      });
      console.log("Headers added to Google Sheet.");
    }
  } catch (error) {
    console.error("Error checking or adding headers:", error);
    throw error;
  }
};

const appendToSheet = async (data) => {
  try {
    const auth = await authenticateGoogleSheets();
    const sheets = google.sheets({ version: "v4", auth });

    // Ensure headers are present
    await checkAndAddHeaders(sheets, SHEET_ID);

    const resource = {
      values: data,
    };

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      resource,
    });

    console.log("Data appended to Google Sheet.");
    return response;
  } catch (error) {
    console.error("Error appending to Google Sheets:", error);
    throw error;
  }
};

// Modified generateCSV to work with Google Sheets
const generateGoogleSheet = async (movements, outputPath) => {
  try {
    const uniqueMovements = await checkForDuplicates(movements, outputPath);

    if (uniqueMovements.length === 0) {
      console.log("No new movements to append.");
      return;
    }

    const formattedData = uniqueMovements.map((movement) => [
      movement.cardName,
      movement.oldLocation,
      movement.newLocation,
      movement.timestamp,
    ]);

    await appendToSheet(formattedData);
    console.log("New movement records have been appended to Google Sheets.");
  } catch (error) {
    console.error("Error generating or appending to Google Sheets:", error);
    throw error;
  }
};

export default generateGoogleSheet;
