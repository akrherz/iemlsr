import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { cronMinute, startCronTasks, stopCronTasks } from '../src/cronManager.js';
import { getState, setState, StateKeys } from '../src/state.js';
import { loadData } from '../src/dataManager.js';

jest.mock('../src/state.js', () => ({
    getState: jest.fn(),
    setState: jest.fn(),
    StateKeys: {
        REALTIME: 'realtime',
        SECONDS: 'seconds',
        ETS: 'ets',
        STS: 'sts'
    }
}));

jest.mock('../src/dataManager.js', () => ({
    loadData: jest.fn()
}));

describe('Cron Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        stopCronTasks();
    });

    afterEach(() => {
        stopCronTasks();
        jest.useRealTimers();
    });

    test('should export all expected functions', () => {
        expect(typeof cronMinute).toBe('function');
        expect(typeof startCronTasks).toBe('function');
        expect(typeof stopCronTasks).toBe('function');
    });

    describe('cronMinute', () => {
        test('should not update state or load data when not in realtime mode', () => {
            getState.mockReturnValue(false);

            cronMinute();

            expect(setState).not.toHaveBeenCalled();
            expect(loadData).not.toHaveBeenCalled();
        });

        test('should update timestamps and load data when in realtime mode', () => {
            const mockNow = new Date('2025-11-24T12:00:00Z');
            jest.setSystemTime(mockNow);

            getState.mockImplementation((key) => {
                if (key === StateKeys.REALTIME) {
                    return true;
                }
                if (key === StateKeys.SECONDS) {
                    return 14400;
                }
                return null;
            });

            cronMinute();

            expect(setState).toHaveBeenCalledWith(StateKeys.ETS, expect.any(Date));
            expect(setState).toHaveBeenCalledWith(StateKeys.STS, expect.any(Date));
            expect(loadData).toHaveBeenCalled();

            const etsCall = setState.mock.calls.find(call => call[0] === StateKeys.ETS);
            const stsCall = setState.mock.calls.find(call => call[0] === StateKeys.STS);
            
            expect(etsCall[1].getTime()).toBe(mockNow.getTime());
            expect(stsCall[1].getTime()).toBe(mockNow.getTime() - 14400 * 1000);
        });

        test('should handle invalid seconds value (not a number)', () => {
            // Suppress console.error output during test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            
            getState.mockImplementation((key) => {
                if (key === StateKeys.REALTIME) {
                    return true;
                }
                if (key === StateKeys.SECONDS) {
                    return 'invalid';
                }
                return null;
            });

            cronMinute();

            expect(consoleSpy).toHaveBeenCalledWith('Invalid seconds value in state:', 'invalid');
            expect(setState).not.toHaveBeenCalled();
            expect(loadData).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should handle invalid seconds value (zero)', () => {
            // Suppress console.error output during test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            
            getState.mockImplementation((key) => {
                if (key === StateKeys.REALTIME) {
                    return true;
                }
                if (key === StateKeys.SECONDS) {
                    return 0;
                }
                return null;
            });

            cronMinute();

            expect(consoleSpy).toHaveBeenCalledWith('Invalid seconds value in state:', 0);
            expect(setState).not.toHaveBeenCalled();
            expect(loadData).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should handle invalid seconds value (negative)', () => {
            // Suppress console.error output during test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            
            getState.mockImplementation((key) => {
                if (key === StateKeys.REALTIME) {
                    return true;
                }
                if (key === StateKeys.SECONDS) {
                    return -100;
                }
                return null;
            });

            cronMinute();

            expect(consoleSpy).toHaveBeenCalledWith('Invalid seconds value in state:', -100);
            expect(setState).not.toHaveBeenCalled();
            expect(loadData).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('startCronTasks', () => {
        test('should start interval timer', () => {
            const setIntervalSpy = jest.spyOn(window, 'setInterval');

            startCronTasks();

            expect(setIntervalSpy).toHaveBeenCalledWith(cronMinute, 60000);
        });

        test('should not start multiple intervals when called multiple times', () => {
            const setIntervalSpy = jest.spyOn(window, 'setInterval');

            startCronTasks();
            startCronTasks();
            startCronTasks();

            expect(setIntervalSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('stopCronTasks', () => {
        test('should clear interval when cron tasks are running', () => {
            const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

            startCronTasks();
            stopCronTasks();

            expect(clearIntervalSpy).toHaveBeenCalled();
        });

        test('should allow starting cron tasks again after stopping', () => {
            const setIntervalSpy = jest.spyOn(window, 'setInterval');

            startCronTasks();
            stopCronTasks();
            startCronTasks();

            expect(setIntervalSpy).toHaveBeenCalledTimes(2);
        });

        test('should handle being called when no cron tasks are running', () => {
            const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

            stopCronTasks();

            expect(clearIntervalSpy).not.toHaveBeenCalled();
        });
    });
});
