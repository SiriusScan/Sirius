import axios from "axios";

//Should expand this to be qName agnostic
export const sendMsg = async (payload: object) => {
  const url = "http://192.168.0.7:9001/app/scan";
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error(`Error making POST request to ${url}:`, error);
    throw error;
  }
};
