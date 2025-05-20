// Modal manager for reports modal
export function initializeReportsModal() {
    const reportsToggle = document.getElementById('reports-toggle');
    const reportsModal = document.getElementById('reports-modal');
    const modalHeader = document.querySelector('.modal-header');
    const minimizeBtn = document.getElementById('minimize-modal');
    const maximizeBtn = document.getElementById('maximize-modal');
    const closeBtn = document.getElementById('close-modal');

    // Modal drag functionality
    let isDragging = false;
    let initialX;
    let initialY;

    function dragStart(e) {
        if (reportsModal.classList.contains('minimized')) return;
        isDragging = true;
        initialX = e.clientX - reportsModal.offsetLeft;
        initialY = e.clientY - reportsModal.offsetTop;
    }

    function drag(e) {
        if (!isDragging || reportsModal.classList.contains('minimized')) return;
        e.preventDefault();
        
        const x = e.clientX - initialX;
        const y = e.clientY - initialY;
        
        reportsModal.style.left = `${x}px`;
        reportsModal.style.top = `${y}px`;
        reportsModal.style.transform = 'none';
    }

    function dragEnd() {
        isDragging = false;
    }

    // Modal event listeners
    reportsToggle.addEventListener('click', () => {
        reportsModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    closeBtn.addEventListener('click', () => {
        reportsModal.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal if clicking outside
    reportsModal.addEventListener('click', (e) => {
        if (e.target === reportsModal) {
            reportsModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    minimizeBtn.addEventListener('click', () => {
        reportsModal.classList.toggle('minimized');
        if (!reportsModal.classList.contains('minimized')) {
            // Reset position when un-minimizing
            reportsModal.style.left = '50%';
            reportsModal.style.top = '50%';
            reportsModal.style.transform = 'translate(-50%, -50%)';
        }
    });

    maximizeBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            reportsModal.style.transform = '';
            reportsModal.style.left = '0';
            reportsModal.style.top = '0';
        }
    });

    modalHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    modalHeader.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
}
