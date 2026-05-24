/* Source of truth */
let cardTitles = [];

/* UI and Application state Variables */
let isAdding = false;
let isEditing = null; //No need for this boolean variable
let draggedCardId = null; //Temporarily store the id of the card being dragged.
let isFilterOpen = false;
let isChevronOpen = false;

/* ----------------Getting elements from DOM------------ */

//For all filter icons in the DOM
const filterIcon = document.querySelectorAll(".filter-icon");
console.log("hello", filterIcon);
/* let filterSection = document.getElementById("filter-section");*/

//For all more icons in the DOM
const moreIcon = document.querySelectorAll(".column-more-icon");
console.log("hello", moreIcon);

// For more icons in the sidebar
const moreSidebarIcons = document.querySelectorAll(".sidebar-more-icon");

const chevronIcon = document.getElementById("chevron-icon");
let chevronSection = document.getElementById("chevron-section");

const addCardBtn = document.getElementById("addCardBtn");

const cardContainer = document.querySelector(".box1 .cards"); // SideBar Drop Zone
const columnContainers = document.querySelectorAll(".task"); //Column Drop Zone

/* State verification function domain functions must verify the parameter */
function verifyArray(state) {
  if (!Array.isArray(state)) throw new Error("Invalid state!");
}

/* --Domain functions and custom errors--*/

//Add card domain function
function addSideBarCard(currentCard, card) {
  //verifying source of truth proxy
  verifyArray(currentCard);

  //throw if empty input or white space or not a string
  if (
    !card ||
    typeof card.title !== "string" ||
    card.title.trim() === "" ||
    card.title.length < 3
  ) {
    throw new Error("Invalid card title");
  }

  //Create title for added card
  const newCardTitle = {
    id: crypto.randomUUID(),
    title: card.title.trim(),
    column: "sidebar", //Every card knows where it lives i.e "sidebar" = left side
  };

  //Use spread operator to add newCard title to the beginning of the currentCard array
  return [newCardTitle, ...currentCard];
}

//Define the custom error for editNote function
class EditWithoutIdError extends Error {
  constructor() {
    super("Tried to edit with no note selected");
  }
}
//Edit card domain function but i dont need it anymore
function editSideBarCard(currentCard, id, updatedField) {
  //verifying source of truth proxy
  verifyArray(currentCard);

  //Throw error check for id
  if (!id) throw new EditWithoutIdError();

  //Throw error check for missing field
  if (!updatedField || updatedField.title.trim() === "")
    throw new Error("No updated data provided");

  return currentCard.map((cardTitle) =>
    cardTitle.id === id ? { ...cardTitle, ...updatedField } : cardTitle,
  );
}

//Define the custom error for delete function
class DeleteWithoutIdError extends Error {
  constructor() {
    super("Tried to delete a note without an id");
  }
}

//Delete card domain function
function deleteCardTitle(currentCard, id) {
  //verifying source of truth proxy
  verifyArray(currentCard);

  //Throw error check for id
  if (!id) throw new DeleteWithoutIdError();

  return currentCard.filter((cardTitle) => cardTitle.id !== id);
}

//handling click outside function here

function globalClickOutside(event) {
  //Handling filter section click on and outside the icon
  //If the closest thing we have to the target element has the id: filter-section then do nothing
  if (event.target.closest("#filter-section")) {
    return;
  }
  //Otherwise hide the filter section popover
  filterSection.classList.add("hide");

  //Handling chevron section when clicked in and outside it
  if (event.target.closest("#chevron-section")) {
    return;
  }
  //Otherwise hide the chevron section popover
  chevronSection.classList.add("hide");
}

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

/* --Async boundary should be below domain functions --reversing changes*/

const api = {
  setTitles() {
    try {
      localStorage.setItem("cardTitles", JSON.stringify(cardTitles));
    } catch (err) {
      throw new Error("Failed to save title");
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

/* -- Orchestrator -- */

function init() {
  cardTitles = api.getTitles();
  renderCardDetails();
}
init();

/* ---------------------Application Render function side effects -------------------------*/
function renderCardDetails() {
  cardContainer.innerHTML = "";

  //Go through ALL cards and give me ONLY the ones whose home is the sidebar
  //if you removed it Your sidebar would try to render EVERY card
  //sidebar cards, today cards, week cards,later cards
  const sidebarCards = cardTitles.filter((c) => c.column === "sidebar");

  // 1. Render existing cards
  for (const title of sidebarCards) {
    const li = document.createElement("li");
    li.textContent = title.title;
    li.classList.add("list-items");
    li.dataset.id = title.id;
    li.draggable = true;

    //Allow dragging of cards and set the dragged card id to the current card's id
    li.addEventListener("dragstart", () => {
      draggedCardId = title.id;
      li.classList.add("dragging");
    });

    //Remove dragging styles and reset dragged card id when dragging ends
    li.addEventListener("dragend", () => {
      draggedCardId = null;
      li.classList.remove("dragging");
    });

    // Edit button for each card to enable editing of card titles
    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    editBtn.classList.add("edit-btn");

    editBtn.onclick = () => {
      //Create Input
      const editedInput = document.createElement("input");
      editedInput.classList.add("add-card-input");
      editedInput.placeholder = "Enter text here...";
      editedInput.type = "text";

      // 2. Pre-fill with current text
      editedInput.value = title.title;

      // 3. Clear existing text
      li.firstChild.remove(); // removes text node

      // 4. Insert input at the beginning
      li.prepend(editedInput);

      // 5. Focus input
      editedInput.focus();

      // 6. Save on Enter
      editedInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const newValue = editedInput.value;

          //If input is empty throw error
          if (newValue.trim() === "") throw new Error("Please provide text!!");

          // 7. Update source of truth
          title.title = newValue;

          // 8. Restore UI
          li.firstChild.remove(); // remove input
          li.prepend(document.createTextNode(newValue));
          api.setTitles(cardTitles);
        }
      });
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.classList.add("delete-btn");

    deleteBtn.onclick = () => {
      const previousTitle = cardTitles;

      try {
        const updatedTitle = deleteCardTitle(cardTitles, title.id);
        cardTitles = updatedTitle;
        renderCardDetails();
        api.setTitles(cardTitles);
      } catch (err) {
        cardTitles = previousTitle;
      } finally {
        renderCardDetails();
      }
    };

    //Wrap Buttons in a Container
    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group");

    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(buttonGroup);

    // Attach li group to cardContainer
    cardContainer.appendChild(li);
  } //Loop ends here

  // No:2 Render cards in columns based on their column property makes the UI reflect the current state of the source of truth regarding the column each card belongs to
  columnContainers.forEach((column) => {
    //Help identify the element by there data like the columns in the HTML document i.e data-column
    //And prevent repeated task across multiple column
    const columnName = column.dataset.column;
    column.innerHTML = ""; // clear column

    //Give me only the cards that belong to THIS column
    const columnCards = cardTitles.filter((c) => c.column === columnName);

    columnCards.forEach((card) => {
      const div = document.createElement("div");
      div.textContent = card.title;
      div.draggable = true;
      div.classList.add("column-card");

      //Makes the columnCards draggable
      div.addEventListener("dragstart", () => {
        draggedCardId = card.id;
        div.classList.add("dragging");
      });

      div.addEventListener("dragend", () => {
        draggedCardId = null;
        div.classList.remove("dragging");
      });

      column.appendChild(div);
    });
  });

  // 2. Render input UI (ONLY ONCE)
  if (isAdding) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    const input = document.createElement("input");
    input.classList.add("add-card-input");
    input.placeholder = "Enter title...";
    input.id = "text";

    const addBtn = document.createElement("button");
    addBtn.classList.add("add-btn");
    addBtn.textContent = "Add";

    const cancelBtn = document.createElement("button");
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.textContent = "Cancel";

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btn-group");

    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(cancelBtn);

    wrapper.appendChild(input);
    wrapper.appendChild(btnGroup);

    cardContainer.appendChild(wrapper);

    // Add logic
    addBtn.onclick = () => {
      try {
        cardTitles = addSideBarCard(cardTitles, {
          title: input.value,
        });

        api.setTitles();
        isAdding = false;
      } catch (err) {
        console.error(err.message);
      } finally {
        renderCardDetails();
      }
    };

    // Cancel logic
    cancelBtn.onclick = () => {
      isAdding = false;
      renderCardDetails();
    };
  }
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
    if (!draggedCardId) return;
    //Each card carries its own location (column), and the UI simply displays based on that.
    //Go through all cards, and update ONLY the one I dropped”
    cardTitles = cardTitles.map((card) =>
      card.id === draggedCardId
        ? { ...card, column: columnName } // Drop card title here. When you drop, this runs So now the card becomes:{ id, title, column: "column" }
        : card,
    );

    api.setTitles();
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
  if (!draggedCardId) return;

  cardTitles = cardTitles.map((card) =>
    card.id === draggedCardId ? { ...card, column: "sidebar" } : card,
  );

  api.setTitles();
  renderCardDetails();
});

//Add card orchestrators
addCardBtn.addEventListener("click", () => {
  isAdding = true;
  renderCardDetails();
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
  const wasOpen = isChevronOpen;
  e.stopPropagation();

  closeAllPopovers(); //Close all popovers

  if (!wasOpen) {
    isChevronOpen = true;
    chevronSection.classList.remove("hide"); //Open the clicked icon popover
  } else {
    isChevronOpen = false;
  }
});

//For making Lucid icons display
lucide.createIcons();
