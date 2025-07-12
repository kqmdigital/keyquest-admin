/**
 * KEYQUEST ADMIN PANEL - UNIFIED JAVASCRIPT
 * ==========================================
 * Complete functionality for all admin pages
 */

// ===================================
// GLOBAL VARIABLES & CONFIGURATION
// ===================================

const AdminApp = {
    currentPage: '',
    currentUser: null,
    editingItemId: null,
    notifications: [],
    config: {
        apiBaseUrl: '/api',
        itemsPerPage: 10,
        debounceDelay: 300
    }
};

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Set current page
    AdminApp.currentPage = getCurrentPage();
    
    // Set active navigation
    setActiveNavigation();
    
    // Initialize responsive handlers
    initializeResponsive();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Initialize forms
    initializeForms();
    
    // Initialize modals
    initializeModals();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Page loaded successfully', 'success');
    }, 500);

    console.log('Admin App initialized for page:', AdminApp.currentPage);
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
}

function setActiveNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = AdminApp.currentPage;
    
    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
}

// ===================================
// MOBILE & RESPONSIVE FUNCTIONALITY
// ===================================

function initializeResponsive() {
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
}

function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (window.innerWidth > 768) {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

// ===================================
// NOTIFICATION SYSTEM
// ===================================

function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: 'check-circle' },
        error: { bg: '#fef2f2', border: '#dc2626', text: '#dc2626', icon: 'x-circle' },
        warning: { bg: '#fef3c7', border: '#d97706', text: '#b45309', icon: 'alert-triangle' },
        info: { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8', icon: 'info' }
    };

    const color = colors[type] || colors.info;

    notification.innerHTML = `
        <div style="
            background: ${color.bg};
            border: 1px solid ${color.border};
            color: ${color.text};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            cursor: pointer;
        " onclick="this.parentElement.remove()">
            <i data-lucide="${color.icon}" style="width: 16px; height: 16px;"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Re-initialize icons for the new notification
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);

    // Store in notifications array
    AdminApp.notifications.push({
        message,
        type,
        timestamp: new Date()
    });
}

// ===================================
// LOADING STATES
// ===================================

function showLoading(message = 'Loading...') {
    hideLoading(); // Remove existing loader
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(4px);
        ">
            <div style="
                background: white;
                padding: 24px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            ">
                <div class="loading-spinner"></div>
                <span style="color: #374151; font-weight: 500;">${message}</span>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}

async function withLoading(asyncFunction, message = 'Loading...') {
    showLoading(message);
    try {
        const result = await asyncFunction();
        return result;
    } catch (error) {
        showNotification('An error occurred: ' + error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// ===================================
// MODAL FUNCTIONALITY
// ===================================

function initializeModals() {
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId, title = null) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal not found:', modalId);
        return;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update title if provided
    if (title) {
        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        clearValidationErrors(form);
    }
    
    // Reset editing state
    AdminApp.editingItemId = null;
    
    // Reset modal title
    const titleElement = modal.querySelector('.modal-title');
    if (titleElement) {
        const originalTitle = titleElement.dataset.originalTitle || titleElement.textContent;
        titleElement.textContent = originalTitle;
    }
}

// ===================================
// FORM HANDLING
// ===================================

function initializeForms() {
    // Handle all form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Add validation to inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formId = form.id;
    
    // Validate form
    if (!validateForm(form)) {
        showNotification('Please fix the errors below', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Handle different form types
    switch (formId) {
        case 'bankForm':
            handleBankForm(data);
            break;
        case 'agentForm':
            handleAgentForm(data);
            break;
        case 'bankerForm':
            handleBankerForm(data);
            break;
        case 'rateTypeForm':
            handleRateTypeForm(data);
            break;
        case 'packageForm':
            handlePackageForm(data);
            break;
        default:
            console.log('Form submitted:', formId, data);
            showNotification('Form submitted successfully', 'success');
    }
}

function validateForm(form) {
    let isValid = true;
    clearValidationErrors(form);
    
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'This field is required');
    }
    
    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = 'color: #dc2626; font-size: 12px; margin-top: 4px;';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearValidationErrors(form) {
    form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
    form.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, AdminApp.config.debounceDelay);
    });
}

function performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Get the table body based on current page
    let tableId;
    switch (AdminApp.currentPage) {
        case 'banks': tableId = 'banksTable'; break;
        case 'agents': tableId = 'agentsTable'; break;
        case 'bankers': tableId = 'bankersTable'; break;
        case 'rate-types': tableId = 'rateTypesTable'; break;
        case 'rate-packages': tableId = 'packagesTable'; break;
        case 'enquiry': tableId = 'enquiryTable'; break;
        default: return;
    }
    
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const shouldShow = !term || text.includes(term);
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Update pagination info if exists
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo && term) {
        paginationInfo.textContent = `Showing ${visibleCount} results for "${searchTerm}"`;
    }
}

// ===================================
// FILTER FUNCTIONALITY
// ===================================

function applyFilters() {
    const filters = {};
    
    // Collect all filter values
    document.querySelectorAll('.filter-select').forEach(select => {
        if (select.value) {
            filters[select.id] = select.value;
        }
    });
    
    // Get search term
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        filters.search = searchInput.value.toLowerCase();
    }
    
    // Apply filters based on current page
    switch (AdminApp.currentPage) {
        case 'rate-packages':
            filterRatePackages(filters);
            break;
        case 'rate-types':
            filterRateTypes(filters);
            break;
        case 'enquiry':
            filterEnquiries(filters);
            break;
        default:
            // Generic filter
            performSearch(filters.search || '');
    }
    
    showNotification('Filters applied', 'info');
}

function clearFilters() {
    // Clear all filter selects
    document.querySelectorAll('.filter-select').forEach(select => {
        select.value = '';
    });
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Show all rows
    const tableSelectors = ['#banksTable tr', '#agentsTable tr', '#bankersTable tr', '#rateTypesTable tr', '#packagesTable tr', '#enquiryTable tr'];
    tableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(row => {
            row.style.display = '';
        });
    });
    
    // Reset pagination info
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const originalText = paginationInfo.dataset.originalText || paginationInfo.textContent;
        paginationInfo.textContent = originalText;
    }
    
    showNotification('All filters cleared', 'info');
}

function filterRatePackages(filters) {
    const rows = document.querySelectorAll('#packagesTable tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.cells;
        let show = true;
        
        if (filters.bankFilter && !cells[0].textContent.includes(filters.bankFilter)) show = false;
        if (filters.propertyFilter && !cells[1].textContent.includes(filters.propertyFilter)) show = false;
        if (filters.buyFilter && !cells[2].textContent.includes(filters.buyFilter)) show = false;
        if (filters.loanFilter && !cells[7].textContent.includes(filters.loanFilter)) show = false;
        if (filters.rateFilter && !cells[5].textContent.includes(filters.rateFilter)) show = false;
        if (filters.lockFilter && !cells[8].textContent.includes(filters.lockFilter)) show = false;
        if (filters.search && !row.textContent.toLowerCase().includes(filters.search)) show = false;
        
        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    
    updatePaginationInfo(visibleCount, 'packages');
}

function filterRateTypes(filters) {
    const rows = document.querySelectorAll('#rateTypesTable tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.cells;
        let show = true;
        
        if (filters.bankFilter && !cells[2].textContent.includes(filters.bankFilter)) show = false;
        if (filters.search && !row.textContent.toLowerCase().includes(filters.search)) show = false;
        
        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    
    updatePaginationInfo(visibleCount, 'rate types');
}

function filterEnquiries(filters) {
    const rows = document.querySelectorAll('#enquiryTable tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.cells;
        let show = true;
        
        if (filters.statusFilter) {
            const statusBadge = cells[6].querySelector('.status-badge');
            if (!statusBadge || !statusBadge.textContent.includes(filters.statusFilter)) show = false;
        }
        if (filters.search && !row.textContent.toLowerCase().includes(filters.search)) show = false;
        
        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    
    updatePaginationInfo(visibleCount, 'enquiries');
}

function updatePaginationInfo(count, itemType) {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        if (!paginationInfo.dataset.originalText) {
            paginationInfo.dataset.originalText = paginationInfo.textContent;
        }
        paginationInfo.textContent = `Showing ${count} ${itemType}`;
    }
}

// ===================================
// CRUD OPERATIONS
// ===================================

// Bank operations
function handleBankForm(data) {
    if (AdminApp.editingItemId) {
        updateBank(AdminApp.editingItemId, data.bankName);
    } else {
        createBank(data.bankName);
    }
    closeModal('bank-modal');
}

function createBank(name) {
    if (!name?.trim()) {
        showNotification('Bank name is required', 'error');
        return;
    }
    
    const tableBody = document.getElementById('banksTable');
    if (!tableBody) return;
    
    const newId = Date.now();
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="bank-name">${escapeHtml(name)}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editBank(${newId}, '${escapeHtml(name)}')">
                    <i data-lucide="edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteBank(${newId}, '${escapeHtml(name)}')">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow);
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    showNotification(`Bank "${name}" added successfully`, 'success');
}

function editBank(id, currentName) {
    AdminApp.editingItemId = id;
    
    const modal = document.getElementById('bank-modal');
    const nameInput = document.getElementById('bankName');
    const title = modal.querySelector('.modal-title');
    
    if (nameInput) nameInput.value = currentName;
    if (title) title.textContent = 'Edit Bank';
    
    openModal('bank-modal');
}

function updateBank(id, newName) {
    if (!newName?.trim()) {
        showNotification('Bank name is required', 'error');
        return;
    }
    
    const rows = document.querySelectorAll('#banksTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editBank(${id}"]`);
        if (editBtn) {
            // Update the name in the table
            row.cells[0].textContent = newName;
            
            // Update button onclick attributes
            const editButton = row.querySelector('.btn-edit');
            const deleteButton = row.querySelector('.btn-delete');
            if (editButton) editButton.setAttribute('onclick', `editBank(${id}, '${escapeHtml(newName)}')`);
            if (deleteButton) deleteButton.setAttribute('onclick', `deleteBank(${id}, '${escapeHtml(newName)}')`);
        }
    });
    
    showNotification(`Bank updated to "${newName}"`, 'success');
}

function deleteBank(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    const rows = document.querySelectorAll('#banksTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editBank(${id}"]`);
        if (editBtn) {
            row.remove();
        }
    });
    
    showNotification(`Bank "${name}" deleted successfully`, 'success');
}

// Agent operations
function handleAgentForm(data) {
    if (AdminApp.editingItemId) {
        updateAgent(AdminApp.editingItemId, data);
    } else {
        createAgent(data);
    }
    closeModal('agent-modal');
}

function createAgent(data) {
    if (!data.agentName?.trim() || !data.agentEmail?.trim()) {
        showNotification('Name and email are required', 'error');
        return;
    }
    
    const tableBody = document.getElementById('agentsTable');
    if (!tableBody) return;
    
    const newId = Date.now();
    const status = data.agentStatus || 'Active';
    const statusClass = status === 'Active' ? 'status-active' : 'status-inactive';
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="agent-name">${escapeHtml(data.agentName)}</td>
        <td>${escapeHtml(data.agentEmail)}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-view" onclick="viewAgent(${newId})">
                    <i data-lucide="eye"></i> View
                </button>
                <button class="btn btn-sm btn-edit" onclick="editAgent(${newId})">
                    <i data-lucide="edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteAgent(${newId})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    showNotification(`Agent "${data.agentName}" added successfully`, 'success');
}

function editAgent(id) {
    AdminApp.editingItemId = id;
    
    const rows = document.querySelectorAll('#agentsTable tr');
    let agentData = null;
    
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editAgent(${id})"]`);
        if (editBtn) {
            agentData = {
                name: row.cells[0].textContent,
                email: row.cells[1].textContent,
                status: row.cells[2].textContent.trim()
            };
        }
    });
    
    if (agentData) {
        const nameInput = document.getElementById('agentName');
        const emailInput = document.getElementById('agentEmail');
        const statusSelect = document.getElementById('agentStatus');
        const title = document.querySelector('#agent-modal .modal-title');
        
        if (nameInput) nameInput.value = agentData.name;
        if (emailInput) emailInput.value = agentData.email;
        if (statusSelect) statusSelect.value = agentData.status;
        if (title) title.textContent = 'Edit Agent';
        
        openModal('agent-modal');
    }
}

function updateAgent(id, data) {
    const rows = document.querySelectorAll('#agentsTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editAgent(${id})"]`);
        if (editBtn) {
            const statusClass = data.agentStatus === 'Active' ? 'status-active' : 'status-inactive';
            
            row.cells[0].textContent = data.agentName;
            row.cells[1].textContent = data.agentEmail;
            row.cells[2].innerHTML = `<span class="status-badge ${statusClass}">${data.agentStatus}</span>`;
        }
    });
    
    showNotification(`Agent "${data.agentName}" updated successfully`, 'success');
}

function deleteAgent(id) {
    if (!confirm('Are you sure you want to delete this agent?')) {
        return;
    }
    
    const rows = document.querySelectorAll('#agentsTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editAgent(${id})"]`);
        if (editBtn) {
            const agentName = row.cells[0].textContent;
            row.remove();
            showNotification(`Agent "${agentName}" deleted successfully`, 'success');
        }
    });
}

function viewAgent(id) {
    showNotification('View agent functionality would show detailed information here', 'info');
}

// Banker operations
function handleBankerForm(data) {
    if (AdminApp.editingItemId) {
        updateBanker(AdminApp.editingItemId, data);
    } else {
        createBanker(data);
    }
    closeModal('banker-modal');
}

function createBanker(data) {
    if (!data.bankerName?.trim() || !data.bankerEmail?.trim()) {
        showNotification('Name and email are required', 'error');
        return;
    }
    
    const tableBody = document.getElementById('bankersTable');
    if (!tableBody) return;
    
    // Get selected bank access
    const selectedBanks = [];
    document.querySelectorAll('#banker-modal input[type="checkbox"]:checked').forEach(cb => {
        selectedBanks.push(cb.value);
    });
    const bankAccess = selectedBanks.length > 0 ? selectedBanks.join(' ') : '-';
    
    const newId = Date.now();
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="banker-name">${escapeHtml(data.bankerName)}</td>
        <td>${escapeHtml(data.bankerEmail)}</td>
        <td class="bank-access">${escapeHtml(bankAccess)}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editBanker(${newId})">
                    <i data-lucide="edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteBanker(${newId})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    showNotification(`Banker "${data.bankerName}" added successfully`, 'success');
}

function editBanker(id) {
    AdminApp.editingItemId = id;
    
    const rows = document.querySelectorAll('#bankersTable tr');
    let bankerData = null;
    
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editBanker(${id})"]`);
        if (editBtn) {
            bankerData = {
                name: row.cells[0].textContent,
                email: row.cells[1].textContent,
                bankAccess: row.cells[2].textContent
            };
        }
    });
    
    if (bankerData) {
        const nameInput = document.getElementById('bankerName');
        const emailInput = document.getElementById('bankerEmail');
        const title = document.querySelector('#banker-modal .modal-title');
        
        if (nameInput) nameInput.value = bankerData.name;
        if (emailInput) emailInput.value = bankerData.email;
        if (title) title.textContent = 'Edit Banker';
        
        // Check appropriate bank access checkboxes
        document.querySelectorAll('#banker-modal input[type="checkbox"]').forEach(cb => cb.checked = false);
        if (bankerData.bankAccess !== '-') {
            const banks = bankerData.bankAccess.split(' ');
            banks.forEach(bank => {
                const checkbox = document.querySelector(`#banker-modal input[value="${bank}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        openModal('banker-modal');
    }
}

function updateBanker(id, data) {
    const selectedBanks = [];
    document.querySelectorAll('#banker-modal input[type="checkbox"]:checked').forEach(cb => {
        selectedBanks.push(cb.value);
    });
    const bankAccess = selectedBanks.length > 0 ? selectedBanks.join(' ') : '-';
    
    const rows = document.querySelectorAll('#bankersTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editBanker(${id})"]`);
        if (editBtn) {
            row.cells[0].textContent = data.bankerName;
            row.cells[1].textContent = data.bankerEmail;
            row.cells[2].textContent = bankAccess;
        }
    });
    
    showNotification(`Banker "${data.bankerName}" updated successfully`, 'success');
}

function deleteBanker(id) {
    if (!confirm('Are you sure you want to delete this banker?')) {
        return;
    }
    
    const rows = document.querySelectorAll('#bankersTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editBanker(${id})"]`);
        if (editBtn) {
            const bankerName = row.cells[0].textContent;
            row.remove();
            showNotification(`Banker "${bankerName}" deleted successfully`, 'success');
        }
    });
}

// Rate Type operations
function handleRateTypeForm(data) {
    if (AdminApp.editingItemId) {
        updateRateType(AdminApp.editingItemId, data);
    } else {
        createRateType(data);
    }
    closeModal('rate-type-modal');
}

function createRateType(data) {
    if (!data.rateType?.trim() || !data.rateValue) {
        showNotification('Rate type and value are required', 'error');
        return;
    }
    
    const tableBody = document.getElementById('rateTypesTable');
    if (!tableBody) return;
    
    // Get selected banks
    const selectedBanks = [];
    document.querySelectorAll('#rate-type-modal input[type="checkbox"]:checked').forEach(cb => {
        selectedBanks.push(cb.value);
    });
    const bankNames = selectedBanks.length > 0 ? selectedBanks.join(', ') : '-';
    
    const newId = Date.now();
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><strong>${escapeHtml(data.rateType)}</strong></td>
        <td class="rate-value">${parseFloat(data.rateValue).toFixed(2)}%</td>
        <td class="bank-list">${escapeHtml(bankNames)}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editRateType(${newId})">
                    <i data-lucide="edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteRateType(${newId})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    showNotification(`Rate type "${data.rateType}" added successfully`, 'success');
}

function editRateType(id) {
    AdminApp.editingItemId = id;
    showNotification('Edit rate type functionality', 'info');
    // Implementation would populate form with existing data
}

function updateRateType(id, data) {
    showNotification(`Rate type updated successfully`, 'success');
}

function deleteRateType(id) {
    if (!confirm('Are you sure you want to delete this rate type?')) {
        return;
    }
    
    const rows = document.querySelectorAll('#rateTypesTable tr');
    rows.forEach(row => {
        const editBtn = row.querySelector(`button[onclick*="editRateType(${id})"]`);
        if (editBtn) {
            const rateType = row.cells[0].textContent;
            row.remove();
            showNotification(`Rate type "${rateType}" deleted successfully`, 'success');
        }
    });
}

// Package operations
function handlePackageForm(data) {
    showNotification('Rate package saved successfully', 'success');
    closeModal('package-modal');
}

function editPackage(id) {
    showNotification(`Opening edit form for package ${id}`, 'info');
}

function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this rate package?')) {
        return;
    }
    
    const row = event.target.closest('tr');
    if (row) {
        row.remove();
        showNotification('Rate package deleted successfully', 'success');
    }
}

// Enquiry operations
function viewEnquiry(id) {
    const enquiryData = getEnquiryData(id);
    if (enquiryData) {
        populateEnquiryModal(enquiryData);
        openModal('enquiry-modal');
    }
}

function updateEnquiryStatus(id, status) {
    showNotification(`Enquiry status updated to ${status}`, 'success');
}

function deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) {
        return;
    }
    
    const rows = document.querySelectorAll('#enquiryTable tr');
    rows.forEach(row => {
        const viewBtn = row.querySelector(`button[onclick*="viewEnquiry(${id})"]`);
        if (viewBtn) {
            const customerName = row.cells[1].textContent;
            row.remove();
            showNotification(`Enquiry from "${customerName}" deleted successfully`, 'success');
        }
    });
}

function getEnquiryData(id) {
    // This would typically fetch from a database
    return {
        id: id,
        customerName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+65 9123 4567',
        propertyType: 'Private Property',
        loanAmount: '$800,000',
        status: 'New',
        message: 'Looking for the best mortgage rates...'
    };
}

function populateEnquiryModal(data) {
    const fields = {
        'customerName': data.customerName,
        'customerEmail': data.email,
        'customerPhone': data.phone,
        'propertyType': data.propertyType,
        'loanAmount': data.loanAmount,
        'enquiryStatus': data.status,
        'enquiryMessage': data.message
    };
    
    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.textContent = fields[fieldId];
        }
    });
}

// ===================================
// PAGINATION
// ===================================

function loadPage(pageNumber) {
    showNotification(`Loading page ${pageNumber}...`, 'info');
    
    // Update active page button
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent == pageNumber) {
            btn.classList.add('active');
        }
    });
    
    // Here you would implement actual pagination logic
    console.log('Load page:', pageNumber);
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            } else {
                closeSidebar();
            }
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + N to add new item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('.btn-primary[onclick*="modal"]');
            if (addButton) {
                addButton.click();
            }
        }
        
        // Alt + M to toggle sidebar on mobile
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            toggleSidebar();
        }
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-SG');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-SG');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// ===================================
// DATA EXPORT FUNCTIONS
// ===================================

function exportToCSV(filename = 'export.csv') {
    const table = document.querySelector('.table');
    if (!table) {
        showNotification('No table found to export', 'error');
        return;
    }
    
    const rows = [];
    const headers = [];
    
    // Get headers
    table.querySelectorAll('th').forEach(th => {
        if (!th.textContent.includes('Actions')) {
            headers.push(th.textContent.trim());
        }
    });
    rows.push(headers);
    
    // Get data rows
    table.querySelectorAll('tbody tr').forEach(tr => {
        if (tr.style.display !== 'none') {
            const row = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                if (index < headers.length) {
                    row.push(td.textContent.trim().replace(/,/g, ';'));
                }
            });
            rows.push(row);
        }
    });
    
    // Create CSV content
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

function printTable() {
    const printWindow = window.open('', '_blank');
    const table = document.querySelector('.data-table');
    
    if (!table) {
        showNotification('No table found to print', 'error');
        return;
    }
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Print - ${AdminApp.currentPage}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .action-buttons { display: none; }
                </style>
            </head>
            <body>
                <h1>${AdminApp.currentPage.charAt(0).toUpperCase() + AdminApp.currentPage.slice(1)} Data</h1>
                ${table.outerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// ===================================
// GLOBAL ERROR HANDLING
// ===================================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred', 'error');
});

// ===================================
// PERFORMANCE MONITORING
// ===================================

function logPerformance(action) {
    if (window.performance && window.performance.mark) {
        window.performance.mark(`${action}-${Date.now()}`);
    }
}

// ===================================
// EXPORT FOR GLOBAL USE
// ===================================

// Make functions globally available
window.AdminApp = AdminApp;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.withLoading = withLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.loadPage = loadPage;
window.exportToCSV = exportToCSV;
window.printTable = printTable;

// CRUD operations
window.editBank = editBank;
window.deleteBank = deleteBank;
window.editAgent = editAgent;
window.deleteAgent = deleteAgent;
window.viewAgent = viewAgent;
window.editBanker = editBanker;
window.deleteBanker = deleteBanker;
window.editRateType = editRateType;
window.deleteRateType = deleteRateType;
window.editPackage = editPackage;
window.deletePackage = deletePackage;
window.viewEnquiry = viewEnquiry;
window.updateEnquiryStatus = updateEnquiryStatus;
window.deleteEnquiry = deleteEnquiry;

console.log('Admin JavaScript framework loaded successfully');
