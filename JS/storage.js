/* --Async boundary should be below domain functions --reversing changes And storage*/
import { state } from "./state.js";
export const storage = {
  setTitles() {
    try {
      localStorage.setItem("cardTitles", JSON.stringify(state.cardTitles));
    } catch (err) {
      console.log("Storage Error:", err);
    }
  },

  getTitles() {
    try {
      const storedTitles = JSON.parse(localStorage.getItem("cardTitles"));
      return storedTitles || [];
    } catch (err) {
      return [];
    }
  },
};
