/**
 * Update the user interface when realtime mode is active
 * @param {Function} updateTimeInputs Function to update the time input fields
 * @param {Function} loadData Function to load new data
 */
export function cronMinute(updateTimeInputs, loadData) {
    if (document.getElementById('realtime').checked) {
        updateTimeInputs();
        loadData();
    }
}

/**
 * Start periodic tasks
 * @param {Object} options Configuration object
 */
export function startCronTasks({ updateTimeInputs, loadData }) {
    window.setInterval(() => cronMinute(updateTimeInputs, loadData), 60000);
}
