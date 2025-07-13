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
    // Initialize Lucide icons - FIXED
    if (typeof lucide !== 'undefined') {
        try {
            lucide.createIcons();
            console.log('✅ Lucide icons initialized successfully');
        } catch (error) {
            console.warn('⚠️ Lucide icons failed to initialize:', error);
        }
    } else {
        console.warn('⚠️ Lucide library not found');
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
    
    // Load recent actions
    loadRecentActions();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Page loaded successfully', 'success');
    }, 500);

    console.log('✅ Admin App initialized for page:', AdminApp.currentPage);
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
                if (typeof applyFilters === 'function') {
                    applyFilters();
                }
            }, AdminApp.config.debounceDelay);
        });
    }
    
    // Setup filter change listeners
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            if (typeof applyFilters === 'function') {
                applyFilters();
            }
        });
    });
    
    console.log('✅ Enhanced filtering initialized');
}

function setupMultiSelectFilters() {
    // This function can be extended for multi-select functionality
    const multiSelects = document.querySelectorAll('[data-multi-select]');
    multiSelects.forEach(select => {
        // Convert to multi-select if needed
        // Implementation can be added here
    });
}

// ===================================
// RESPONSIVE HANDLERS
// ===================================

function initializeResponsive() {
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const overlay = document.getElementById('overlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    // Initial resize check
    handleWindowResize();
}

function handleWindowResize() {
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');
    
    if (!isMobile && sidebar) {
        sidebar.classList.remove('mobile-open');
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
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
// SEARCH FUNCTIONALITY
// ===================================

function initializeSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        input.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value, e.target.dataset.search);
            }, AdminApp.config.debounceDelay);
        });
    });
}

function performSearch(query, target) {
    // Implement search logic based on target
    console.log(`Searching for "${query}" in ${target}`);
    
    // This can be extended based on the specific search requirements
    const searchableElements = document.querySelectorAll(`[data-searchable="${target}"]`);
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        const isVisible = text.includes(query.toLowerCase());
        element.style.display = isVisible ? '' : 'none';
    });
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeTopModal();
        }
        
        // Ctrl/Cmd + N for new item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('[onclick*="openModal"]');
            if (addButton) {
                addButton.click();
            }
        }
    });
}

// ===================================
// FORM HANDLING
// ===================================

function initializeForms() {
    const forms = document.querySelectorAll('form[data-auto-submit]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(form);
        });
    });
    
    // Auto-save functionality
    const autoSaveForms = document.querySelectorAll('form[data-auto-save]');
    autoSaveForms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', debounce(() => {
                autoSaveForm(form);
            }, 1000));
        });
    });
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form submitted:', data);
    
    // Show loading state
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
        setButtonLoading(submitButton, true);
    }
    
    // Simulate form submission (replace with actual logic)
    setTimeout(() => {
        if (submitButton) {
            setButtonLoading(submitButton, false);
        }
        showNotification('Form submitted successfully', 'success');
    }, 1000);
}

function autoSaveForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Auto-saving form:', data);
    
    // Store in localStorage as backup
    try {
        localStorage.setItem(`autosave_${form.id}`, JSON.stringify(data));
        showNotification('Draft saved', 'info', 2000);
    } catch (error) {
        console.warn('Auto-save failed:', error);
    }
}

// ===================================
// MODAL MANAGEMENT
// ===================================

function initializeModals() {
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Initialize modal close buttons
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId, data = null) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`Modal ${modalId} not found`);
        return;
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
    
    // Populate with data if provided
    if (data && modalId.includes('modal')) {
        populateModalForm(modal, data);
    }
    
    // Reinitialize icons in modal
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Clear form if it exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
    
    // Clear editing state
    AdminApp.editingItemId = null;
}

function closeTopModal() {
    const visibleModals = Array.from(document.querySelectorAll('.modal'))
        .filter(modal => modal.style.display === 'flex');
    
    if (visibleModals.length > 0) {
        const topModal = visibleModals[visibleModals.length - 1];
        closeModal(topModal.id);
    }
}

function populateModalForm(modal, data) {
    const form = modal.querySelector('form');
    if (!form || !data) return;
    
    Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = Boolean(data[key]);
            } else if (field.type === 'radio') {
                if (field.value === data[key]) {
                    field.checked = true;
                }
            } else {
                field.value = data[key] || '';
            }
        }
    });
}

// ===================================
// NOTIFICATION SYSTEM
// ===================================

function showNotification(message, type = 'info', duration = 5000) {
    const notification = createNotificationElement(message, type);
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    // Store in array
    AdminApp.notifications.push({
        message,
        type,
        timestamp: new Date()
    });
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="removeNotification(this.closest('.notification'))">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    return notification;
}

function removeNotification(notification) {
    if (notification && notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// ===================================
// LOADING STATES
// ===================================

function setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            Loading...
        `;
    } else {
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}

function showPageLoading(show = true) {
    let loader = document.getElementById('page-loader');
    
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="page-loader-overlay">
                <div class="page-loader-content">
                    <div class="loading-spinner large"></div>
                    <p>Loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else if (!show && loader) {
        loader.remove();
    }
}

// ===================================
// AUTHENTICATION HELPERS
// ===================================

function checkAuthenticationStatus() {
    // This should integrate with your auth system
    const isAuthenticated = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    
    if (!isAuthenticated && !window.location.pathname.includes('login')) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        signOut();
    }
}

function signOut() {
    // Clear any stored data
    localStorage.removeItem('admin_session');
    sessionStorage.clear();
    
    // Show notification
    showNotification('Signing out...', 'info');
    
    // Redirect to login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
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
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
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

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// DATA EXPORT FUNCTIONALITY
// ===================================

function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    try {
        const csv = convertToCSV(data);
        downloadCSV(csv, filename);
        showNotification('Data exported successfully', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'error');
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(csvContent, filename) {
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
// ICON MANAGEMENT - ENHANCED
// ===================================

function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        try {
            lucide.createIcons();
            console.log('🔄 Icons refreshed successfully');
        } catch (error) {
            console.warn('⚠️ Failed to refresh icons:', error);
        }
    }
}

function ensureIconsLoaded() {
    // Check if icons are properly loaded and retry if needed
    const iconElements = document.querySelectorAll('[data-lucide]');
    let missingIcons = 0;
    
    iconElements.forEach(element => {
        if (!element.querySelector('svg')) {
            missingIcons++;
        }
    });
    
    if (missingIcons > 0) {
        console.log(`🔄 Reloading ${missingIcons} missing icons...`);
        setTimeout(refreshIcons, 100);
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
    showNotification('A system error occurred', 'error');
});

// ===================================
// PERFORMANCE MONITORING
// ===================================

function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
}

// ===================================
// INITIALIZATION COMPLETION
// ===================================

// Auto-check for missing icons after page load
window.addEventListener('load', function() {
    setTimeout(ensureIconsLoaded, 500);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminApp;
} else {
    window.AdminApp = AdminApp;
}

console.log('🚀 Enhanced Admin JavaScript framework loaded successfully');
