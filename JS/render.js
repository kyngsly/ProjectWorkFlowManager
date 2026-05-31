console.log("RENDER FILE LOADED");
/* Importing state variables from state file */
import { state } from "./state.js";

/* Importing domain function from domain file */
import { addSideBarCard, deleteCardTitle } from "./domain.js";

/* Importing Dom variables from domVariables file */
import { cardContainer, columnContainers } from "./domVariables.js";

/*Importing API storage from storage file */
import { storage } from "./storage.js";

/* ---------------------Application Render function side effects -------------------------*/
export function renderCardDetails() {
  cardContainer.innerHTML = "";

  //Go through ALL cards and give me ONLY the ones whose home is the sidebar
  //if you removed it Your sidebar would try to render EVERY card
  //sidebar cards, today cards, week cards,later cards
  const sidebarCards = state.cardTitles.filter((c) => c.column === "sidebar");

  // 1. Render existing cards
  for (const title of sidebarCards) {
    const li = document.createElement("li");
    li.textContent = title.title;
    li.classList.add("list-items");
    li.dataset.id = title.id;
    li.draggable = true;

    //Allow dragging of cards and set the dragged card id to the current card's id
    li.addEventListener("dragstart", () => {
      state.draggedCardId = title.id;
      li.classList.add("dragging");
    });

    //Remove dragging styles and reset dragged card id when dragging ends
    li.addEventListener("dragend", () => {
      state.draggedCardId = null;
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
          storage.setTitles(state.cardTitles);
        }
      });
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.classList.add("delete-btn");

    deleteBtn.onclick = () => {
      const previousTitle = state.cardTitles;

      try {
        const updatedTitle = deleteCardTitle(state.cardTitles, title.id);
        state.cardTitles = updatedTitle;
        storage.setTitles(state.cardTitles);
      } catch (err) {
        state.cardTitles = previousTitle;
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
    const columnCards = state.cardTitles.filter((c) => c.column === columnName);

    columnCards.forEach((card) => {
      const div = document.createElement("div");
      div.textContent = card.title;
      div.draggable = true;
      div.classList.add("column-card");

      //Makes the columnCards draggable
      div.addEventListener("dragstart", () => {
        state.draggedCardId = card.id;
        div.classList.add("dragging");
      });

      div.addEventListener("dragend", () => {
        state.draggedCardId = null;
        div.classList.remove("dragging");
      });

      column.appendChild(div);
    });
  });

  // 2. Render input UI (ONLY ONCE)
  if (state.isAdding) {
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
      console.log("BEFORE:", state.cardTitles);

      try {
        state.cardTitles = addSideBarCard(state.cardTitles, {
          title: input.value,
        });
        console.log("BEFORE:", state.cardTitles);

        storage.setTitles(state.cardTitles);
        state.isAdding = false;
      } catch (err) {
        console.error(err.message);
      } finally {
        renderCardDetails();
      }
    };

    // Cancel logic
    cancelBtn.onclick = () => {
      state.isAdding = false;
      renderCardDetails();
    };
  }
}
