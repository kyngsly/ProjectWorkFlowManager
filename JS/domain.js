/* --Domain functions and custom errors--*/

/* State verification function domain functions must verify the parameter */
function verifyArray(state) {
  if (!Array.isArray(state)) throw new Error("Invalid state!");
}

//Add card domain function
export function addSideBarCard(currentCard, card) {
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

//Define the custom error for delete function
export class DeleteWithoutIdError extends Error {
  constructor() {
    super("Tried to delete a note without an id");
  }
}

//Delete card domain function
export function deleteCardTitle(currentCard, id) {
  //verifying source of truth proxy
  verifyArray(currentCard);

  //Throw error check for id
  if (!id) throw new DeleteWithoutIdError();

  return currentCard.filter((cardTitle) => cardTitle.id !== id);
}
