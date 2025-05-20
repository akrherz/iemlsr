// Modal manager for LSR and SBW modals
function initializeModal(modalId, toggleId, minimizeId, maximizeId, closeId) {
    const toggle = document.getElementById(toggleId);
    const modal = document.getElementById(modalId);
    const modalHeader = modal.querySelector('.modal-header');
    const minimizeBtn = document.getElementById(minimizeId);
    const maximizeBtn = document.getElementById(maximizeId);
    const closeBtn = document.getElementById(closeId);

    /** @type {boolean} Track dragging state */
    let isDragging = false;
    let initialX;
    let initialY;

    /** @type {number} Store initial position of modal */
    let modalInitialX;
    let modalInitialY;

    /** 
     * Gets current modal position accounting for transforms
     * @returns {{x: number, y: number}}
     */
    function getModalPosition() {
        const style = window.getComputedStyle(modal);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const x = modal.offsetLeft + matrix.m41;
        const y = modal.offsetTop + matrix.m42;
        return { x, y };
    }

    /** 
     * Starts dragging operation on mousedown/touchstart 
     * @param {Event} e - Mouse or touch event
     */
    function dragStart(e) {
        if (modal.classList.contains('minimized')) return;
        
        // Get current position before starting drag
        const pos = getModalPosition();
        modalInitialX = pos.x;
        modalInitialY = pos.y;

        if (e.type === "mousedown") {
            isDragging = true;
            initialX = e.clientX - modalInitialX;
            initialY = e.clientY - modalInitialY;
        } else if (e.type === "touchstart") {
            isDragging = true;
            initialX = e.touches[0].clientX - modalInitialX;
            initialY = e.touches[0].clientY - modalInitialY;
        }
    }

    /** 
     * Handles dragging operation on mousemove/touchmove
     * @param {Event} e - Mouse or touch event
     */
    function drag(e) {
        if (!isDragging || modal.classList.contains('minimized')) return;
        e.preventDefault();
        
        let currentX, currentY;
        if (e.type === "mousemove") {
            currentX = e.clientX;
            currentY = e.clientY;
        } else if (e.type === "touchmove") {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }
        
        // Calculate new position
        const x = currentX - initialX;
        const y = currentY - initialY;
        
        modal.style.transform = 'none';
        modal.style.left = `${x}px`;
        modal.style.top = `${y}px`;
    }

    /** Ends dragging operation */
    function dragEnd() {
        isDragging = false;
    }

    /** Resets modal to default position and state */
    function resetModalState(display = 'block') {
        modal.style.display = display;
        modal.classList.remove('minimized', 'maximized');
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '';
        modal.style.height = '';
        modal.style.maxWidth = '';
        modal.style.maxHeight = '';
        
        // Reset drag state
        isDragging = false;
        initialX = null;
        initialY = null;
        modalInitialX = null;
        modalInitialY = null;
    }

    /** Opens the modal */
    function openModal() {
        resetModalState('block');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    /** Closes the modal */
    function closeModal() {
        modal.classList.remove('open', 'minimized', 'maximized');
        resetModalState('none');
        document.body.style.overflow = '';
    }

    /** 
     * Toggle modal visibility
     * @param {Event} e - Click event 
     */
    function toggleModal(e) {
        e.stopPropagation();
        if (!modal.classList.contains('open')) {
            openModal();
        }
    }

    // Event Listeners
    toggle.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    minimizeBtn.addEventListener('click', () => {
        modal.classList.toggle('minimized');
        if (!modal.classList.contains('minimized')) {
            resetModalState();
        }
    });

    maximizeBtn.addEventListener('click', () => {
        modal.classList.toggle('maximized');
        if (modal.classList.contains('maximized')) {
            modal.style.transform = 'none';
            modal.style.left = '0';
            modal.style.top = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.maxWidth = '100vw';
            modal.style.maxHeight = '100vh';
        } else {
            resetModalState();
        }
    });

    // Drag handlers
    modalHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    modalHeader.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);

    // Initialize modal state
    resetModalState('none');
}

export function initializeModals() {
    // Initialize LSR Modal
    initializeModal('lsr-modal', 'lsr-toggle', 'minimize-lsr', 'maximize-lsr', 'close-lsr');
    
    // Initialize SBW Modal
    initializeModal('sbw-modal', 'sbw-toggle', 'minimize-sbw', 'maximize-sbw', 'close-sbw');
}
