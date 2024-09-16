function toggleDropdown(id) {
    var dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
function selectAll(button) {
    var form = button.closest('form');
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    var allChecked = true;
    checkboxes.forEach(function (checkbox) {
        if (!checkbox.checked) {
            allChecked = false;
        }
    });
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = !allChecked;
    });
}
function joinMe(form) {
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            var label = checkbox.parentElement;
            label.innerHTML = label.textContent.trim() + " - Joined Me";
        }
    });
}
function denyParticipants(form) {
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            checkbox.parentElement.remove(); 
        }
    });
}
function removeEvent(button) {
    var eventContainer = button.closest('.event');
    eventContainer.remove();
}

