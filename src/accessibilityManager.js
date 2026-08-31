export function announceStatus(message) {
    const status = document.getElementById('app-status');
    if (status) {
        status.textContent = message;
    }
}