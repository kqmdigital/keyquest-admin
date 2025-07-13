/**
 * KEYQUEST ADMIN PANEL - ENHANCED JAVASCRIPT
 * ==========================================
 * Complete functionality for all admin pages with enhanced filtering
 */

// ===================================
// GLOBAL VARIABLES & CONFIGURATION
// ===================================

const AdminApp = {
    currentPage: '',
    currentUser: null,
    editingItemId: null,
    notifications: [],
    recentActions: [],
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

    // Initialize enhanced filtering for rate packages
    if (AdminApp.currentPage === 'rate-packages') {
        initializeEnhancedFiltering();
    }
    
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
// ENHANCED FILTERING SYSTEM
// ===================================

function initializeEnhancedFiltering() {
    // Setup multi-select filter listeners
    setupMultiSelectFilters();
    
    // Setup search input listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterPackages();
            }, AdminApp.config.debounceDelay);
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.multi-select-filter')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
}

function setupMultiSelectFilters() {
    // Add change listeners to all filter checkboxes
    document.querySelectorAll('.multi-select-dropdown input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleFilterChange(this);
        });
    });
}

function toggleMultiSelect(filterId) {
    const filter = document.getElementById(filterId);
    if (!filter) return;
    
    const dropdown = filter.querySelector('.multi-select-dropdown');
    if (!dropdown) return;
    
    // Close all other dropdowns
    document.querySelectorAll('.multi-select-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });
    
    // Toggle current dropdown
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function handleFilterChange(checkbox) {
    const filter = checkbox.closest('.multi-select-filter');
    const filterId = filter.id;
    
    // Handle "All" checkbox logic
    if (checkbox.value.includes('All')) {
        const otherCheckboxes = filter.querySelectorAll('input[type="checkbox"]:not([value*="All"])');
        if (checkbox.checked) {
            // If "All" is checked, uncheck others
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
    } else {
        // If a specific option is checked, uncheck "All"
        const allCheckbox = filter.querySelector('input[value*="All"]');
        if (checkbox.checked && allCheckbox) {
            allCheckbox.checked = false;
        }
        
        // If no specific options are checked, check "All"
        const specificCheckboxes = filter.querySelectorAll('input[type="checkbox"]:not([value*="All"]):checked');
        if (specificCheckboxes.length === 0 && allCheckbox) {
            allCheckbox.checked = true;
        }
    }
    
    updateFilterButtonText(filter);
    
    // Apply filters with debounce
    clearTimeout(window.filterTimeout);
    window.filterTimeout = setTimeout(() => {
        if (typeof filterPackages === 'function') {
            filterPackages();
        }
    }, 300);
}

function updateFilterButtonText(filter) {
    const button = filter.querySelector('.filter-select-btn span');
    const checkboxes = filter.querySelectorAll('input[type="checkbox"]:checked');
    const allCheckbox = filter.querySelector('input[value*="All"]');
    
    if (!button) return;
    
    const baseText = button.textContent.split(' - ')[0];
    
    if (checkboxes.length === 0 || (checkboxes.length === 1 && allCheckbox && allCheckbox.checked)) {
        button.textContent = baseText;
    } else {
        const selectedCount = allCheckbox && allCheckbox.checked ? 0 : checkboxes.length;
        if (selectedCount > 0) {
            button.textContent = `${baseText} - ${selectedCount} selected`;
        } else {
            button.textContent = baseText;
        }
    }
}

function getSelectedFilterValues(filterId) {
    const filter = document.getElementById(filterId);
    if (!filter) return [];
    
    const checkboxes = filter.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value).filter(value => !value.includes('All'));
}

function getAllSelectedFilters() {
    return {
        propertyType: getSelectedFilterValues('propertyTypeFilter'),
        buyUnder: getSelectedFilterValues('buyUnderFilter'),
        loanType: getSelectedFilterValues('loanTypeFilter'),
        rateType: getSelectedFilterValues('rateTypeFilter'),
        lockPeriod: getSelectedFilterValues('lockPeriodFilter'),
        loanAmount: getSelectedFilterValues('loanAmountFilter'),
        bank: getSelectedFilterValues('bankFilter')
    };
}

function clearAllFilters() {
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset all checkboxes
    document.querySelectorAll('.multi-select-dropdown input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = checkbox.value.includes('All');
    });
    
    // Update all filter button texts
    document.querySelectorAll('.multi-select-filter').forEach(filter => {
        updateFilterButtonText(filter);
    });
    
    // Apply filters
    if (typeof filterPackages === 'function') {
        filterPackages();
    }
    
    showNotification('All filters cleared', 'info');
}

// ===================================
// MOBILE & RESPONSIVE FUNCTIONALITY
// ===================================

function initializeResponsive() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    // Auto-hide sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar?.classList.add('sidebar-hidden');
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar?.classList.remove('sidebar-hidden');
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('sidebar-hidden');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.add('sidebar-hidden');
}

// ===================================
// NOTIFICATION SYSTEM
// ===================================

function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    
    const container = getOrCreateNotificationContainer();
    container.appendChild(notification);
    
    // Initialize Lucide icons for the notification
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-remove notification
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, duration);
    
    // Add to notifications array
    AdminApp.notifications.push({
        message,
        type,
        timestamp: new Date().toISOString()
    });
}

function getOrCreateNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// ===================================
// LOADING STATES
// ===================================

function showLoading(message = 'Loading...') {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) {
        loading.remove();
    }
}

function withLoading(asyncFunction, message = 'Processing...') {
    return async function(...args) {
        try {
            showLoading(message);
            const result = await asyncFunction.apply(this, args);
            return result;
        } finally {
            hideLoading();
        }
    };
}

// ===================================
// MODAL MANAGEMENT
// ===================================

function initializeModals() {
    // Add click listeners to modal overlays
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus on first input if available
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Reset form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Clear editing state
        AdminApp.editingItemId = null;
    }
}

// ===================================
// FORM INITIALIZATION
// ===================================

function initializeForms() {
    // Add form validation and enhancement
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                showNotification('Please fill in all required fields correctly', 'error');
            }
        });
    });
    
    // Add input enhancements
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.setCustomValidity('Please enter a valid email address');
                this.classList.add('input-error');
            } else {
                this.setCustomValidity('');
                this.classList.remove('input-error');
            }
        });
    });
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('input-error');
            isValid = false;
        } else {
            field.classList.remove('input-error');
        }
    });
    
    return isValid;
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
        case 'rate-packages': 
            // Use custom filtering for rate packages
            if (typeof filterPackages === 'function') {
                filterPackages();
            }
            return;
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
// KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + N for new item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('.btn-primary[onclick*="Modal"]');
            if (addButton) {
                addButton.click();
            }
        }
    });
}

// ===================================
// EXPORT FUNCTIONALITY
// ===================================

function exportToCSV(filename) {
    const table = document.querySelector('.table');
    if (!table) {
        showNotification('No data to export', 'error');
        return;
    }
    
    const rows = Array.from(table.querySelectorAll('tr:not([style*="display: none"])'));
    const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => {
            // Remove action buttons from export
            if (cell.querySelector('.action-buttons')) {
                return '';
            }
            
            let text = cell.textContent.trim();
            // Escape quotes and wrap in quotes if contains comma
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                text = '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
        }).join(',');
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showNotification('Data exported successfully', 'success');
}

function printTable() {
    const table = document.querySelector('.table');
    if (!table) {
        showNotification('No data to print', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Print ${AdminApp.currentPage.charAt(0).toUpperCase() + AdminApp.currentPage.slice(1)}</title>
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
// AUTHENTICATION
// ===================================

function confirmSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        signOut();
    }
}

function signOut() {
    // Clear any stored data
    localStorage.removeItem('admin_session');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = 'login.html';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatCurrency(amount, currency = 'SGD') {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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

// ===================================
// RECENT ACTIONS MANAGEMENT
// ===================================

function addRecentAction(type, description, details = {}) {
    const action = {
        id: Date.now(),
        type,
        description,
        details,
        timestamp: new Date().toISOString(),
        user: AdminApp.currentUser || 'admin'
    };
    
    AdminApp.recentActions.unshift(action);
    
    // Keep only last 50 actions
    if (AdminApp.recentActions.length > 50) {
        AdminApp.recentActions = AdminApp.recentActions.slice(0, 50);
    }
    
    // Store in localStorage for persistence
    try {
        localStorage.setItem('admin_recent_actions', JSON.stringify(AdminApp.recentActions));
    } catch (e) {
        console.warn('Unable to store recent actions:', e);
    }
    
    // Update UI if on rate-packages page
    if (AdminApp.currentPage === 'rate-packages' && typeof updateRecentActions === 'function') {
        updateRecentActions();
    }
}

function loadRecentActions() {
    try {
        const stored = localStorage.getItem('admin_recent_actions');
        if (stored) {
            AdminApp.recentActions = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Unable to load recent actions:', e);
        AdminApp.recentActions = [];
    }
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
// INITIALIZATION ON PAGE LOAD
// ===================================

// Load recent actions on page load
loadRecentActions();

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
window.toggleMultiSelect = toggleMultiSelect;
window.clearAllFilters = clearAllFilters;
window.exportToCSV = exportToCSV;
window.printTable = printTable;
window.confirmSignOut = confirmSignOut;
window.addRecentAction = addRecentAction;

console.log('Enhanced Admin JavaScript framework loaded successfully');

// Add these functions to your existing admin-scripts.js file

// ===================================
// RATE TYPES SPECIFIC FUNCTIONS
// ===================================

// Enhanced search functionality for rate types
function performRateTypeSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const tableBody = document.getElementById('rateTypesTable');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr:not(.no-data)');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;
        
        const text = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
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

// Enhanced multi-select functionality
window.toggleMultiSelect = function(event) {
    event.stopPropagation();
    const dropdown = event.currentTarget;
    const options = dropdown.querySelector('.multiselect-options');
    const arrow = dropdown.querySelector('.multiselect-arrow');
    
    // Close other open dropdowns
    document.querySelectorAll('.multiselect-options.show').forEach(openOptions => {
        if (openOptions !== options) {
            openOptions.classList.remove('show');
            const openArrow = openOptions.parentElement.querySelector('.multiselect-arrow');
            if (openArrow) openArrow.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current dropdown
    options.classList.toggle('show');
    if (arrow) {
        arrow.style.transform = options.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

// Bank selection management
window.updateBankSelection = function(optionsId, displayId) {
    const options = document.getElementById(optionsId);
    const display = document.getElementById(displayId);
    
    if (!options || !display) return;
    
    const checkedBoxes = options.querySelectorAll('input[type="checkbox"]:checked');
    const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);
    
    if (selectedValues.length === 0) {
        display.textContent = 'Select banks';
        display.style.color = '#9ca3af';
    } else if (selectedValues.length <= 2) {
        display.textContent = selectedValues.join(', ');
        display.style.color = '#374151';
    } else {
        display.textContent = `${selectedValues.slice(0, 2).join(', ')} +${selectedValues.length - 2} more`;
        display.style.color = '#374151';
    }
};

// Validation functions
window.validateRateTypeForm = function(formData, selectedBanks) {
    const errors = [];
    
    // Validate rate type
    const rateType = formData.get('rate_type')?.trim();
    if (!rateType) {
        errors.push('Rate type is required');
    } else if (rateType.length < 2) {
        errors.push('Rate type must be at least 2 characters');
    }
    
    // Validate rate value
    const rateValue = parseFloat(formData.get('rate_value'));
    if (isNaN(rateValue)) {
        errors.push('Rate value is required and must be a number');
    } else if (rateValue < 0) {
        errors.push('Rate value must be positive');
    } else if (rateValue > 100) {
        errors.push('Rate value cannot exceed 100%');
    }
    
    // Validate bank selection
    if (!selectedBanks || selectedBanks.length === 0) {
        errors.push('At least one bank must be selected');
    }
    
    return errors;
};

// Format rate value for display
window.formatRateValue = function(value) {
    if (value === null || value === undefined) return 'N/A';
    return parseFloat(value).toFixed(3) + '%';
};

// Format bank names for table display
window.formatBankDisplay = function(bankNames, maxDisplay = 3) {
    if (!bankNames || !Array.isArray(bankNames) || bankNames.length === 0) {
        return '<span style="color: #9ca3af; font-style: italic;">No banks assigned</span>';
    }
    
    if (bankNames.length <= maxDisplay) {
        return bankNames.map(bank => `<span class="bank-tag">${escapeHtml(bank)}</span>`).join('');
    } else {
        const displayed = bankNames.slice(0, maxDisplay);
        const remaining = bankNames.length - maxDisplay;
        return displayed.map(bank => `<span class="bank-tag">${escapeHtml(bank)}</span>`).join('') + 
               `<span class="bank-tag more">+${remaining} more</span>`;
    }
};

// Enhanced error handling for rate types
window.handleRateTypeError = function(error, operation = 'operation') {
    console.error(`Rate type ${operation} error:`, error);
    
    let message = `Failed to ${operation} rate type`;
    
    // Handle specific error types
    if (typeof error === 'string') {
        if (error.includes('duplicate') || error.includes('unique')) {
            message = 'A rate type with this name and value already exists';
        } else if (error.includes('network') || error.includes('fetch')) {
            message = 'Network error. Please check your connection and try again';
        } else if (error.includes('permission') || error.includes('auth')) {
            message = 'You do not have permission to perform this action';
        }
    }
    
    showNotification(message, 'error');
};

// Enhanced loading states
window.setRateTypeLoading = function(isLoading, element = null) {
    if (element) {
        if (isLoading) {
            element.disabled = true;
            element.innerHTML = '<i data-lucide="loader-2" class="spinner"></i> Loading...';
        } else {
            element.disabled = false;
            // Restore original content
        }
    } else {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};

// Rate type data export
window.exportRateTypes = function(rateTypes, filename = 'rate-types.csv') {
    if (!rateTypes || rateTypes.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = ['Rate Type', 'Rate Value (%)', 'Bank Names', 'Created Date'];
    const csvContent = [
        headers.join(','),
        ...rateTypes.map(rt => [
            `"${(rt.rate_type || '').replace(/"/g, '""')}"`,
            rt.rate_value || '',
            `"${(rt.bank_names || []).join(', ').replace(/"/g, '""')}"`,
            rt.created_at ? new Date(rt.created_at).toLocaleDateString() : ''
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Rate types exported successfully', 'success');
};

// Keyboard shortcuts for rate types page
window.initRateTypeKeyboardShortcuts = function() {
    document.addEventListener('keydown', function(e) {
        // Only apply on rate types page
        if (!window.location.pathname.includes('rate-types')) return;
        
        // Ctrl/Cmd + N for new rate type
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (typeof openAddRateTypeModal === 'function') {
                openAddRateTypeModal();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                const modalId = modal.id;
                if (typeof closeModal === 'function') {
                    closeModal(modalId);
                }
            });
        }
    });
};

// Initialize rate types specific functionality
window.initRateTypesPage = function() {
    // Initialize keyboard shortcuts
    initRateTypeKeyboardShortcuts();
    
    // Add CSS for enhanced styling
    const style = document.createElement('style');
    style.textContent = `
        .bank-tag {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            margin: 1px;
            border: 1px solid #bae6fd;
        }
        
        .bank-tag.more {
            background: #f3f4f6;
            color: #6b7280;
            border-color: #d1d5db;
        }
        
        .multiselect-dropdown {
            position: relative;
            cursor: pointer;
        }
        
        .multiselect-selected {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 20px;
        }
        
        .multiselect-selected:hover {
            border-color: #cbd5e1;
        }
        
        .multiselect-arrow {
            transition: transform 0.2s ease;
            width: 16px;
            height: 16px;
            color: #6b7280;
        }
        
        .multiselect-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        }
        
        .multiselect-options.show {
            display: block;
        }
        
        .multiselect-option {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .multiselect-option:hover {
            background-color: #f8fafc;
        }
        
        .multiselect-option input[type="checkbox"] {
            margin-right: 8px;
            margin-top: 0;
        }
        
        .multiselect-option label {
            margin: 0;
            cursor: pointer;
            flex: 1;
        }
        
        .rate-value {
            font-weight: 600;
            color: #059669;
            font-size: 14px;
        }
        
        .rate-type-name {
            font-weight: 500;
            color: #374151;
        }
        
        .bank-list {
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
        }
        
        .input-group {
            display: flex;
            align-items: center;
            position: relative;
        }
        
        .input-suffix {
            position: absolute;
            right: 12px;
            color: #6b7280;
            font-size: 14px;
            pointer-events: none;
        }
        
        .input-group .form-input {
            padding-right: 30px;
        }
        
        .spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .delete-info {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px;
            margin-top: 12px;
        }
        
        .delete-info strong {
            color: #991b1b;
        }
        
        .no-data {
            text-align: center;
            padding: 40px 20px;
        }
        
        .no-data i {
            display: block;
            margin: 0 auto 16px;
        }
        
        .no-data h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .no-data p {
            margin: 0;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Rate types page functionality initialized');
};

// Auto-initialize if on rate types page
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('rate-types')) {
            initRateTypesPage();
        }
    });
}
