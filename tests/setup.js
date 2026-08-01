import '@testing-library/jest-dom';

jest.mock('datatables.net', () => {
    const DataTable = jest.fn(function DataTable() {
        return {
            destroy: jest.fn(),
            on: jest.fn(),
            draw: jest.fn(),
            column: jest.fn(() => ({ search: jest.fn().mockReturnThis() })),
            row: jest.fn(() => ({
                data: () => ({ geometry: { getExtent: () => [] } }),
                child: {
                    isShown: () => false,
                    hide: jest.fn(),
                    show: jest.fn()
                }
            }))
        };
    });

    DataTable.ext = {
        search: []
    };

    return {
        __esModule: true,
        default: DataTable
    };
});

jest.mock('datatables.net-select-dt', () => ({}));
jest.mock('datatables.net-scroller-dt', () => ({}));
