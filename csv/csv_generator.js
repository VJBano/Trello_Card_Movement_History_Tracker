import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import { parse } from "csv-parse";

// Checks for duplicate movements
export const checkForDuplicates = async (newMovements, outputPath) => {
  if (!fs.existsSync(outputPath)) return newMovements;

  try {
    // Read the existing CSV file and parse its contents
    const existingData = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(outputPath)
        .pipe(
          parse({
            columns: false,
            delimiter: ",",
          })
        )
        .on("data", (row) => {
          results.push({
            cardName: row[0],
            oldLocation: row[1],
            newLocation: row[2],
            timestamp: row[3],
          });
        })
        .on("end", () => resolve(results))
        .on("error", (err) => reject(err));
    });

    const existingIdentifiers = new Set(
      existingData.map((row) => `${row.cardName}-${row.timestamp}`)
    );

    const filteredMovements = newMovements.filter(
      (movement) =>
        !existingIdentifiers.has(`${movement.cardName}-${movement.timestamp}`)
    );

    return filteredMovements;
  } catch (err) {
    console.error("Error reading existing CSV file:", err.message);
    return newMovements;
  }
};

// Generate CSV file from movement records
const generateCSV = async (movements, outputPath) => {
  try {
    // Filter out duplicates from existing data
    const uniqueMovements = await checkForDuplicates(movements, outputPath);

    if (uniqueMovements.length === 0) {
      console.log("No new movements to append.");
      return;
    }

    const headers = [
      { id: "cardName", title: "Card Name" },
      { id: "oldLocation", title: "Old Board/List Name" },
      { id: "newLocation", title: "New Board/List Name" },
      { id: "timestamp", title: "Timestamp of Movement" },
    ];

    // Check if the file exists
    const fileExists = fs.existsSync(outputPath);

    if (!fileExists) {
      const csvWriterWithHeaders = createObjectCsvWriter({
        path: outputPath,
        header: headers,
        append: false,
      });

      await csvWriterWithHeaders.writeRecords([]);
      console.log(`CSV file created with headers at ${outputPath}`);
    }

    // Append new records to the file
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: headers,
      append: true, // Append data without overwriting headers
    });

    await csvWriter.writeRecords(uniqueMovements);
    console.log(`New movement records have been appended to ${outputPath}`);
  } catch (error) {
    console.error("Error generating or appending to CSV:", error.message);
    throw error;
  }
};

export default generateCSV;
