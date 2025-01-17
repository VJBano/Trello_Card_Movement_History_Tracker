import { google } from "googleapis";
import dotenv from "dotenv";
import generateGoogleSheet from "../google/generateGoogleSheet.js";
import { checkForDuplicates } from "../csv/csv_generator.js";

// Mock the entire googleapis module
jest.mock("googleapis", () => ({
  google: {
    sheets: jest.fn().mockReturnValue({
      spreadsheets: {
        values: {
          append: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
        },
      },
    }),
    auth: {
      getClient: jest.fn(),
    },
  },
}));

jest.mock("../csv/csv_generator.js", () => ({
  checkForDuplicates: jest.fn(),
}));

dotenv.config();

describe("generateGoogleSheet", () => {
  const mockMovements = [
    {
      cardName: "Card 1",
      oldLocation: "Board 1",
      newLocation: "Board 2",
      timestamp: "2025-01-17T12:00:00Z",
    },
    {
      cardName: "Card 2",
      oldLocation: "Board 2",
      newLocation: "Board 3",
      timestamp: "2025-01-17T13:00:00Z",
    },
  ];

  const mockOutputPath = "./mock.csv";
  const mockSheets = google.sheets();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    google.auth.getClient.mockResolvedValue("mockAuthClient");

    // Mock successful header check (headers already exist)
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          [
            "Card Name",
            "Old Board/List Name",
            "New Board/List Name",
            "Timestamp of Movement",
          ],
        ],
      },
    });

    // Mock successful update and append operations
    mockSheets.spreadsheets.values.update.mockResolvedValue({
      data: { updatedCells: 4 },
    });
    mockSheets.spreadsheets.values.append.mockResolvedValue({
      data: { updatedCells: 8 },
    });

    // Reset checkForDuplicates mock
    checkForDuplicates.mockReset();
  });

  // ... other tests remain the same ...

  it("should handle errors gracefully", async () => {
    // Mock checkForDuplicates to return some data
    checkForDuplicates.mockResolvedValue(mockMovements);

    // Mock auth to fail
    google.auth.getClient.mockRejectedValue(new Error("Authentication failed"));

    // Create spy for console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // The function should throw when called
    await expect(
      generateGoogleSheet(mockMovements, mockOutputPath)
    ).rejects.toThrow();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating or appending to Google Sheets:",
      expect.any(Error)
    );

    // Clean up
    consoleErrorSpy.mockRestore();
  });

  it("should handle Google Sheets API errors", async () => {
    // Mock checkForDuplicates to return some data
    checkForDuplicates.mockResolvedValue(mockMovements);

    // Mock the Sheets API to fail
    mockSheets.spreadsheets.values.get.mockRejectedValue(
      new Error("API Error")
    );

    // Create spy for console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // The function should throw when called
    await expect(
      generateGoogleSheet(mockMovements, mockOutputPath)
    ).rejects.toThrow();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating or appending to Google Sheets:",
      expect.any(Error)
    );

    // Clean up
    consoleErrorSpy.mockRestore();
  });

  it("should handle checkForDuplicates errors", async () => {
    // Mock checkForDuplicates to fail
    checkForDuplicates.mockRejectedValue(new Error("Duplicate check failed"));

    // Create spy for console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // The function should throw when called
    await expect(
      generateGoogleSheet(mockMovements, mockOutputPath)
    ).rejects.toThrow();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating or appending to Google Sheets:",
      expect.any(Error)
    );

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});
