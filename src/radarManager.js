import * as timeUtils from './timeUtils.js';

class RadarManager {
    constructor() {
        this.baseTime = new Date();
        // Initialize to nearest 5-minute mark
        this.baseTime.setUTCMinutes(this.baseTime.getUTCMinutes() - (this.baseTime.getUTCMinutes() % 5));
    }

    /**
     * Update RADAR times based on current time inputs
     * @param {HTMLElement} stsElement Start time input element
     * @param {HTMLElement} etsElement End time input element
     * @returns {Date} Updated base time
     */
    updateTimes(stsElement, etsElement) {
        this.baseTime = timeUtils.updateRADARTimes(stsElement, etsElement, this.baseTime);
        return this.baseTime;
    }

    /**
     * Get current base time
     * @returns {Date} Current radar base time
     */
    getBaseTime() {
        return this.baseTime;
    }
}

// Export a singleton instance
export const radarManager = new RadarManager();
