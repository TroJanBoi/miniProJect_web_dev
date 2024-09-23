let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-chevrons-right");
sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});