
class RadarManager {
    constructor() {
        this.baseTime = new Date();
        // Initialize to nearest 5-minute mark
        this.baseTime.setUTCMinutes(this.baseTime.getUTCMinutes() - (this.baseTime.getUTCMinutes() % 5));
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
