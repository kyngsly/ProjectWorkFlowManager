console.log("SIDE BAR FILE LOADED");
/* Importing state variables from state file */
import { state } from "./state.js";

/*Importing API storage from storage file */
import { storage } from "./storage.js";

/*Importing renderCardDetails from render file */
import { renderCardDetails } from "./render.js";

import "./event.js";

/* -- Initialization Orchestrator -- */
function init() {
  state.cardTitles = storage.getTitles();
  renderCardDetails();
}
init();

//For making Lucid icons display
lucide.createIcons();
