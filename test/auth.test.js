import axios from "axios";
import { jest } from "@jest/globals";
import { getBoards } from "../trello/board.js";
import { testAuth } from "./testAuth.js";

// Mock axios and other modules
jest.mock("axios");
jest.mock("../trello/board.js");

describe("testAuth", () => {
  // Mock data
  const mockBoards = [
    { id: "1", name: "Board 1" },
    { id: "2", name: "Board 2" },
  ];

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully authenticates and returns boards", async () => {
    // Mock axios.create to return a mock client
    const mockAxiosInstance = jest.fn();
    axios.create.mockReturnValue(mockAxiosInstance);

    // Mock the getBoards function
    getBoards.mockResolvedValue(mockBoards);

    // Test the function
    const result = await testAuth("apiKey", "token");

    // Verify axios.create was called with correct config
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.trello.com/1",
      params: { key: "apiKey", token: "token" },
    });

    expect(getBoards).toHaveBeenCalledWith(mockAxiosInstance);
    expect(result).toEqual(mockBoards);
  });

  it("handles authentication failure", async () => {
    // Mock axios.create
    const mockAxiosInstance = jest.fn();
    axios.create.mockReturnValue(mockAxiosInstance);

    // Mock the API error
    const mockError = new Error("Authentication failed");
    getBoards.mockRejectedValue(mockError);

    // Test the function
    await expect(testAuth("invalidKey", "invalidToken")).rejects.toThrow(
      "Authentication failed"
    );

    // Verify axios.create was called with incorrect credentials
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.trello.com/1",
      params: { key: "invalidKey", token: "invalidToken" },
    });
  });

  it("handles network errors", async () => {
    // Mock axios.create
    const mockAxiosInstance = jest.fn();
    axios.create.mockReturnValue(mockAxiosInstance);

    // Mock a network error
    const mockError = new Error("Network Error");
    getBoards.mockRejectedValue(mockError);

    // Test the function
    await expect(testAuth("apiKey", "token")).rejects.toThrow("Network Error");
  });
});
