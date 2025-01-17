import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import generateCSV from "../csv/csv_generator.js";
import { parse } from "csv-parse";

jest.mock("fs");
jest.mock("csv-writer", () => ({
  createObjectCsvWriter: jest.fn().mockReturnValue({
    writeRecords: jest.fn(),
  }),
}));
jest.mock("csv-parse", () => ({
  parse: jest.fn(),
}));

describe("generateCSV function", () => {
  const outputPath = "./card_movements.csv";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should append new movements to the CSV", async () => {
    // Arrange: Mock fs.existsSync to return true and mock parse to return some initial data
    const mockExistingData = [
      {
        cardName: "Card 1",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:00Z",
      },
    ];
    fs.existsSync.mockReturnValue(true);

    // Mock parse to simulate CSV parsing
    parse.mockImplementation((input, options, callback) => {
      callback(null, mockExistingData); // Return existing data in the CSV file
    });

    const newMovements = [
      {
        cardName: "Card 1",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:01Z",
      }, // New (different timestamp)
      {
        cardName: "Card 2",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:02Z",
      }, // New
    ];

    // Act: Call generateCSV
    const csvWriter = createObjectCsvWriter();
    await generateCSV(newMovements, outputPath);

    // Assert: Check that writeRecords is called for new movements (Card 1 with new timestamp and Card 2)
    expect(csvWriter.writeRecords).toHaveBeenCalledWith([
      {
        cardName: "Card 1",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:01Z",
      },
      {
        cardName: "Card 2",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:02Z",
      },
    ]);
  });

  it("should handle errors when reading the CSV file", async () => {
    // Arrange: Mock fs.existsSync to return true and simulate an error in the parse function
    fs.existsSync.mockReturnValue(true);
    parse.mockImplementation((input, options, callback) => {
      callback(new Error("Error parsing CSV"));
    });

    const newMovements = [
      {
        cardName: "Card 1",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:00Z",
      },
    ];

    // Act & Assert: Ensure generateCSV continues and does not throw when CSV read fails
    await expect(generateCSV(newMovements, outputPath)).resolves.not.toThrow();
  });

  it("should handle errors when writing the CSV file", async () => {
    // Arrange: Mock fs.existsSync to return true and simulate an error in the writeRecords function
    fs.existsSync.mockReturnValue(true);
    const csvWriter = createObjectCsvWriter();
    csvWriter.writeRecords.mockRejectedValue(new Error("Error writing CSV"));

    const newMovements = [
      {
        cardName: "Card 1",
        oldLocation: "Board A / List A",
        newLocation: "Board B / List B",
        timestamp: "2025-01-17T00:00:00Z",
      },
    ];

    // Act & Assert: Ensure generateCSV throws when an error occurs during writing
    await expect(generateCSV(newMovements, outputPath)).rejects.toThrow(
      "Error writing CSV"
    );
  });
});
