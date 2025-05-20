/**
 * Replace HTML special characters with their entity equivalents
 * @param {string} val Input string to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(val) {
    // Create a temporary element
    const div = document.createElement('div');
    // Set text content which will automatically escape HTML special characters
    div.textContent = val;
    // Return the escaped HTML
    return div.innerHTML;
}
