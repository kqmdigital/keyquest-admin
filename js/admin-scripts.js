// ===================================
// NOTIFICATION SYSTEM
// ===================================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
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
    
    container.appendChild(notification);
    
    // Initialize icons if lucide is available
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.classList.add('notification-fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// ===================================
// LOADING SYSTEM
// ===================================
function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i data-lucide="loader-2" class="animate-spin"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.style.display = 'flex';
    
    // Initialize icons if lucide is available
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===================================
// MODAL SYSTEM
// ===================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===================================
// SIDEBAR FUNCTIONS
// ===================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar && overlay && mainContent) {
        const isOpen = sidebar.classList.contains('sidebar-open');
        
        if (isOpen) {
            sidebar.classList.remove('sidebar-open');
            overlay.classList.remove('overlay-active');
            mainContent.classList.remove('main-shifted');
        } else {
            sidebar.classList.add('sidebar-open');
            overlay.classList.add('overlay-active');
            mainContent.classList.add('main-shifted');
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar && overlay && mainContent) {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('overlay-active');
        mainContent.classList.remove('main-shifted');
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCurrency(amount) {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat().format(num);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===================================
// VALIDATION FUNCTIONS
// ===================================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateRequired(fields, formData) {
    const errors = [];
    
    fields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`${field.replace(/_/g, ' ')} is required`);
        }
    });
    
    return errors;
}

// ===================================
// SUPABASE HELPER FUNCTIONS
// ===================================
async function checkAuthentication() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// ===================================
// RATE PACKAGES FUNCTIONS
// ===================================
async function createRatePackage(packageData) {
    try {
        const { data, error } = await supabaseClient
            .from('rate_packages')
            .insert([packageData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create rate package error:', error);
        return { success: false, error: error.message };
    }
}

async function updateRatePackage(id, packageData) {
    try {
        const { data, error } = await supabaseClient
            .from('rate_packages')
            .update({ ...packageData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update rate package error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteRatePackage(id) {
    try {
        const { error } = await supabaseClient
            .from('rate_packages')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete rate package error:', error);
        return { success: false, error: error.message };
    }
}

async function getRatePackages() {
    try {
        const { data, error } = await supabaseClient
            .from('rate_packages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get rate packages error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// BANKS FUNCTIONS
// ===================================
async function createBank(bankData) {
    try {
        const { data, error } = await supabaseClient
            .from('banks')
            .insert([bankData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create bank error:', error);
        return { success: false, error: error.message };
    }
}

async function updateBank(id, bankData) {
    try {
        const { data, error } = await supabaseClient
            .from('banks')
            .update({ ...bankData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update bank error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteBank(id) {
    try {
        const { error } = await supabaseClient
            .from('banks')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete bank error:', error);
        return { success: false, error: error.message };
    }
}

async function getBanks() {
    try {
        const { data, error } = await supabaseClient
            .from('banks')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get banks error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// RATE TYPES FUNCTIONS
// ===================================
async function createRateType(rateTypeData) {
    try {
        const { data, error } = await supabaseClient
            .from('rate_types')
            .insert([rateTypeData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create rate type error:', error);
        return { success: false, error: error.message };
    }
}

async function updateRateType(id, rateTypeData) {
    try {
        const { data, error } = await supabaseClient
            .from('rate_types')
            .update({ ...rateTypeData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update rate type error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteRateType(id) {
    try {
        const { error } = await supabaseClient
            .from('rate_types')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete rate type error:', error);
        return { success: false, error: error.message };
    }
}

async function getRateTypes() {
    try {
        const { data, error } = await supabaseClient
            .from('rate_types')
            .select('*')
            .order('rate_type');
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get rate types error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// AGENTS FUNCTIONS
// ===================================
async function createAgent(agentData) {
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .insert([agentData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create agent error:', error);
        return { success: false, error: error.message };
    }
}

async function updateAgent(id, agentData) {
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .update({ ...agentData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update agent error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteAgent(id) {
    try {
        const { error } = await supabaseClient
            .from('agents')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete agent error:', error);
        return { success: false, error: error.message };
    }
}

async function getAgents() {
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get agents error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// BANKERS FUNCTIONS
// ===================================
async function createBanker(bankerData) {
    try {
        const { data, error } = await supabaseClient
            .from('bankers')
            .insert([bankerData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create banker error:', error);
        return { success: false, error: error.message };
    }
}

async function updateBanker(id, bankerData) {
    try {
        const { data, error } = await supabaseClient
            .from('bankers')
            .update({ ...bankerData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update banker error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteBanker(id) {
    try {
        const { error } = await supabaseClient
            .from('bankers')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete banker error:', error);
        return { success: false, error: error.message };
    }
}

async function getBankers() {
    try {
        const { data, error } = await supabaseClient
            .from('bankers')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get bankers error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// ENQUIRIES FUNCTIONS
// ===================================
async function createEnquiry(enquiryData) {
    try {
        const { data, error } = await supabaseClient
            .from('enquiries')
            .insert([enquiryData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create enquiry error:', error);
        return { success: false, error: error.message };
    }
}

async function updateEnquiry(id, enquiryData) {
    try {
        const { data, error } = await supabaseClient
            .from('enquiries')
            .update({ ...enquiryData, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update enquiry error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteEnquiry(id) {
    try {
        const { error } = await supabaseClient
            .from('enquiries')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete enquiry error:', error);
        return { success: false, error: error.message };
    }
}

async function getEnquiries() {
    try {
        const { data, error } = await supabaseClient
            .from('enquiries')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get enquiries error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// EXPORT/IMPORT FUNCTIONS
// ===================================
function exportToCSV(data, filename, headers = null) {
    try {
        if (!data || !data.length) {
            showNotification('No data to export', 'warning');
            return;
        }

        // Generate headers if not provided
        if (!headers) {
            headers = Object.keys(data[0]).map(key => 
                key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            );
        }

        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                Object.values(row).map(field => {
                    // Handle null/undefined values
                    if (field === null || field === undefined) return '';
                    
                    // Convert to string and escape quotes
                    const stringField = String(field).replace(/"/g, '""');
                    
                    // Wrap in quotes if contains comma, quote, or newline
                    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                        return `"${stringField}"`;
                    }
                    
                    return stringField;
                }).join(',')
            )
        ].join('\n');

        // Download the file
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
            URL.revokeObjectURL(url);
        }

        showNotification('Export completed successfully', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data: ' + error.message, 'error');
    }
}

function printTable(tableId, title = 'Data Report') {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            showNotification('Table not found', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                        .badge-active { background-color: #dcfce7; color: #166534; }
                        .badge-pending { background-color: #fef3c7; color: #92400e; }
                        .badge-secondary { background-color: #f3f4f6; color: #374151; }
                        .action-buttons { display: none; }
                        @media print {
                            .action-buttons { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    ${table.outerHTML}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);

    } catch (error) {
        console.error('Print error:', error);
        showNotification('Failed to print table: ' + error.message, 'error');
    }
}

// ===================================
// ERROR HANDLING
// ===================================
function handleApiError(error, operation = 'operation') {
    console.error(`${operation} error:`, error);
    
    let message = `Failed to ${operation}`;
    
    if (error.message) {
        message += `: ${error.message}`;
    }
    
    showNotification(message, 'error');
    return { success: false, error: error.message };
}

// ===================================
// GLOBAL EVENT LISTENERS
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar state
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        closeSidebar();
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    // Initialize tooltips and other UI elements
    initializeTooltips();
    
    // Check authentication on page load
    checkAuthentication();
});

function initializeTooltips() {
    // Add tooltips to buttons and other elements
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.getAttribute('data-tooltip'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    // Simple tooltip implementation
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = (rect.top - 30) + 'px';
    tooltip.style.left = rect.left + 'px';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '4px 8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ===================================
// GLOBAL ERROR HANDLING
// ===================================
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('An unexpected error occurred', 'error');
});

// ===================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ===================================
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.capitalizeFirst = capitalizeFirst;
window.validateEmail = validateEmail;
window.validateRequired = validateRequired;
window.checkAuthentication = checkAuthentication;
window.exportToCSV = exportToCSV;
window.printTable = printTable;
window.handleApiError = handleApiError;

// Database functions
window.createRatePackage = createRatePackage;
window.updateRatePackage = updateRatePackage;
window.deleteRatePackage = deleteRatePackage;
window.getRatePackages = getRatePackages;
window.createBank = createBank;
window.updateBank = updateBank;
window.deleteBank = deleteBank;
window.getBanks = getBanks;
window.createRateType = createRateType;
window.updateRateType = updateRateType;
window.deleteRateType = deleteRateType;
window.getRateTypes = getRateTypes;
window.createAgent = createAgent;
window.updateAgent = updateAgent;
window.deleteAgent = deleteAgent;
window.getAgents = getAgents;
window.createBanker = createBanker;
window.updateBanker = updateBanker;
window.deleteBanker = deleteBanker;
window.getBankers = getBankers;
window.createEnquiry = createEnquiry;
window.updateEnquiry = updateEnquiry;
window.deleteEnquiry = deleteEnquiry;
window.getEnquiries = getEnquiries;

console.log('Admin JavaScript framework loaded successfully');
