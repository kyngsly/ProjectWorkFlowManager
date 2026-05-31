console.log("EVENT FILE LOADED");
/*Import state from state.js*/
import { state } from "./state.js";

/*Import storage from storage.js*/
import { storage } from "./storage.js";

/*Importing renderCardDetails from render file */
import { renderCardDetails } from "./render.js";

import {
  filterIcon,
  moreIcon,
  moreSidebarIcons,
  chevronIcon,
  chevronSection,
  addCardBtn,
  cardContainer,
  columnContainers,
} from "./domVariables.js";

console.log("addCardBtn =", addCardBtn);
console.log("cardContainer =", cardContainer);
console.log("columnContainers =", columnContainers);

//Before opening ANY popover CLOSE ALL popovers UI orchestration logic Coordinate visible UI behavior
function closeAllPopovers() {
  // Close filter
  document.querySelectorAll(".filter-section").forEach((section) => {
    section.classList.add("hide");
  });

  // Close chevron
  chevronSection.classList.add("hide");

  // Close ALL column popovers
  document.querySelectorAll(".column-more-section").forEach((section) => {
    section.classList.add("hide");
  });

  // Close ALL sidebar popovers
  document.querySelectorAll(".sidebar-more-section").forEach((section) => {
    section.classList.add("hide");
  });
}

//-------------------------------Global event listeners section------------------//

// No:1 Drag and drop event listeners for columns to allow dropping of cards into columns and updating the card's column property in the source of truth
columnContainers.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  //Creating drop zone and updating column data
  column.addEventListener("drop", (e) => {
    //Give me the value of data-column i.e column.dataset."Today"
    //element.dataset.column → "today"
    const columnName = column.dataset.column;

    e.preventDefault();
    console.log("Drop fired");
    if (!state.draggedCardId) return;
    //Each card carries its own location (column), and the UI simply displays based on that.
    //Go through all cards, and update ONLY the one I dropped”
    state.cardTitles = state.cardTitles.map((card) =>
      card.id === state.draggedCardId
        ? { ...card, column: columnName } // Drop card title here. When you drop, this runs So now the card becomes:{ id, title, column: "column" }
        : card,
    );

    storage.setTitles();
    renderCardDetails();
  });
});

//cardContainer drag and drop event listener for sidebar
cardContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
});

cardContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("Drop fired");
  if (!state.draggedCardId) return;

  state.cardTitles = state.cardTitles.map((card) =>
    card.id === state.draggedCardId ? { ...card, column: "sidebar" } : card,
  );

  storage.setTitles();
  renderCardDetails();
});

console.log("addCardBtn =", addCardBtn);
//Add card orchestrators
addCardBtn.addEventListener("click", () => {
  state.isAdding = true;
  renderCardDetails();
  console.log("Added");
});

// ----------Orchestrator for handling toggle of more icon--------//
filterIcon.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("filter clicked");

    //Find the nearest parent class element
    const sideBarFilter = icon.closest(".box1-subSubContainer");
    console.log("This:", sideBarFilter);
    // Find this filters section
    const filterSection = sideBarFilter.querySelector(".filter-section");
    console.log("This:", filterSection);

    //Checking css class for hide property and applying it further based on condition
    const isAlreadyOpen = !filterSection.classList.contains("hide");
    console.log(isAlreadyOpen);

    //Close all the opened popover
    closeAllPopovers();

    //Open the required popover
    if (!isAlreadyOpen) {
      filterSection.classList.remove("hide");
    }
  });
});

// --------------------------Orchestrator for handling toggle of more icon
moreIcon.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation();

    // Find nearest column
    const column = icon.closest(".column");

    // Find this column's menu
    const columnSection = column.querySelector(".column-more-section");

    // Check if menu is already open
    const isAlreadyOpen = !columnSection.classList.contains("hide");

    // Close ALL menus first
    closeAllPopovers();

    // If it was closed before, open it
    if (!isAlreadyOpen) {
      columnSection.classList.remove("hide");
    }
  });
});

moreSidebarIcons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("Sidebar more icon clicked");
    // Find nearest parent class
    const sideBar = icon.closest(".box1-subSubContainer");
    //sidebar section
    const moreSection = sideBar.querySelector(".sidebar-more-section");

    // Check if THIS menu is already open
    const isAlreadyOpen = !moreSection.classList.contains("hide");

    // Close ALL menus first
    closeAllPopovers();

    // If it was closed before, open it
    if (!isAlreadyOpen) {
      moreSection.classList.remove("hide");
    }
  });
});

//Document click orchestrator closes popover when user clicks outside the Icon
document.addEventListener("click", (event) => {
  // If click happened INSIDE menu or icon, do nothing
  if (
    event.target.closest(".column-more-icon") ||
    event.target.closest(".column-more-section") ||
    event.target.closest(".sidebar-more-icon") ||
    event.target.closest(".sidebar-more-section")
  ) {
    return;
  }

  // Otherwise close all menus
  closeAllPopovers();
});

//--------------------------- Orchestrator for handling toggle of chevron icon
chevronIcon.addEventListener("click", (e) => {
  const wasOpen = state.isChevronOpen;
  e.stopPropagation();

  closeAllPopovers(); //Close all popovers

  if (!wasOpen) {
    state.isChevronOpen = true;
    chevronSection.classList.remove("hide"); //Open the clicked icon popover
  } else {
    state.isChevronOpen = false;
  }
});
