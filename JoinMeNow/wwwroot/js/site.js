document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById('loading');
    const content = document.getElementById('content');


    function hideLoadingScreen() {
        loadingScreen.classList.add('hidden');
        content.classList.add('show');
    }

    const timeoutId = setTimeout(() => {
        hideLoadingScreen();
    }, 3000);

    window.onload = function () {
        setTimeout(() => {
            clearTimeout(timeoutId);
            hideLoadingScreen();
        }, 1000);
    };

});
