const shareButton = document.getElementById('shareButton');

shareButton.addEventListener('click', () => {
    if (shareButton.textContent === 'Share Page!') {
        // Change the button text to "Stop sharing" when clicked
        shareButton.textContent = 'Stop sharing';
    } else {
        // Change the button text back to "Share Page!" when clicked again
        shareButton.textContent = 'Share Page!';
    }
});