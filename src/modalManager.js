// Modal manager for LSR and SBW modals
function initializeModal(modalId, toggleId, minimizeId, maximizeId, closeId) {
    const toggle = document.getElementById(toggleId);
    const modal = document.getElementById(modalId);
    const modalHeader = modal.querySelector('.modal-header');
    const minimizeBtn = document.getElementById(minimizeId);
    const maximizeBtn = document.getElementById(maximizeId);
    const closeBtn = document.getElementById(closeId);

    function setupModal() {
        let isDragging = false;
        let initialX;
        let initialY;

        function dragStart(e) {
            if (modal.classList.contains('minimized')) return;
            if (e.type === "mousedown") {
                isDragging = true;
                initialX = e.clientX - modal.offsetLeft;
                initialY = e.clientY - modal.offsetTop;
            } else if (e.type === "touchstart") {
                isDragging = true;
                initialX = e.touches[0].clientX - modal.offsetLeft;
                initialY = e.touches[0].clientY - modal.offsetTop;
            }
        }

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
            
            const x = currentX - initialX;
            const y = currentY - initialY;
            
            modal.style.left = `${x}px`;
            modal.style.top = `${y}px`;
            modal.style.transform = 'none';
        }

        function dragEnd() {
            isDragging = false;
        }

        // Toggle button opens the modal
        toggle.addEventListener('click', () => {
            // Reset modal state when opening
            modal.style.display = '';
            modal.classList.remove('minimized', 'maximized');
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.width = '';
            modal.style.height = '';
            modal.style.maxWidth = '';
            modal.style.maxHeight = '';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        // Close button closes the modal
        closeBtn.addEventListener('click', () => {
            // Reset modal state when closing
            modal.classList.remove('open', 'minimized', 'maximized');
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.width = '';
            modal.style.height = '';
            modal.style.maxWidth = '';
            modal.style.maxHeight = '';
            document.body.style.overflow = '';
        });

        // Clicking outside the modal content closes it
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                // Reset modal state when closing
                modal.classList.remove('open', 'minimized', 'maximized');
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.width = '';
                modal.style.height = '';
                modal.style.maxWidth = '';
                modal.style.maxHeight = '';
                document.body.style.overflow = '';
            }
        });

        // Minimize button toggles the minimized state
        minimizeBtn.addEventListener('click', () => {
            modal.classList.toggle('minimized');
            if (!modal.classList.contains('minimized')) {
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
            }
        });

        // Maximize button expands the modal on mobile
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
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.width = '';
                modal.style.height = '';
                modal.style.maxWidth = '';
                modal.style.maxHeight = '';
            }
        });

        // Modal dragging functionality
        modalHeader.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        modalHeader.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);
    }

    setupModal();
}

export function initializeModals() {
    // Initialize LSR Modal
    initializeModal('lsr-modal', 'lsr-toggle', 'minimize-lsr', 'maximize-lsr', 'close-lsr');
    
    // Initialize SBW Modal
    initializeModal('sbw-modal', 'sbw-toggle', 'minimize-sbw', 'maximize-sbw', 'close-sbw');
}
