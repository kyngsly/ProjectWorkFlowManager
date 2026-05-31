/* ----------------Getting elements from DOM------------ */
console.log("Independent module: DOM variables");
//For all filter icons in the DOM
export const filterIcon = document.querySelectorAll(".filter-icon");

//For all more icons in the DOM
export const moreIcon = document.querySelectorAll(".column-more-icon");

// For more icons in the sidebar
export const moreSidebarIcons = document.querySelectorAll(".sidebar-more-icon");

export const chevronIcon = document.getElementById("chevron-icon");
export let chevronSection = document.getElementById("chevron-section");

export const addCardBtn = document.getElementById("addCardBtn");

export const cardContainer = document.querySelector(".box1 .cards"); // SideBar Drop Zone

export const columnContainers = document.querySelectorAll(".task"); //Column Drop Zone
