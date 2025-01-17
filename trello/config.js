import axios from "axios";

// Create configured axios client
const createTrelloAPI = (apiKey, token) => {
  return axios.create({
    baseURL: "https://api.trello.com/1",
    params: { key: apiKey, token },
  });
};

export default createTrelloAPI;
