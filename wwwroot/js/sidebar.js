let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-chevrons-right");
//console.log(sidebarBtn);
sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});