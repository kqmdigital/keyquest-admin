// config/supabase.js
// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://cuvjbsbvlefirwzngola.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dmpic2J2bGVmaXJ3em5nb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTkwMzQsImV4cCI6MjA2MzI5NTAzNH0.vDA0WrV-Go_EChViXaXF-_0j2EEPJEPTBe7X5tjvLR4',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dmpic2J2bGVmaXJ3em5nb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcxOTAzNCwiZXhwIjoyMDYzMjk1MDM0fQ.9Tp_HbwCBxDFLiw2e5btAg2zQB3xIx897O29AnUotmk'
};

// Initialize Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Auth Helper Functions - Custom admin_users table implementation
class AuthService {
    static async signIn(email, password) {
        try {
            // Call Supabase database function for secure password verification
            const { data, error } = await supabaseClient.rpc('authenticate_admin', {
                user_email: email,
                user_password: password
            });
            
            if (error) {
                console.error('Authentication error:', error);
                return { success: false, error: 'Invalid email or password' };
            }

            if (!data || !data.success) {
                return { success: false, error: data?.message || 'Invalid credentials' };
            }

            // Store user session in localStorage (in production, use more secure storage)
            const userSession = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('admin_session', JSON.stringify(userSession));
            localStorage.setItem('session_expires', (Date.now() + (24 * 60 * 60 * 1000)).toString()); // 24 hours

            // Update last login
            await this.updateLastLogin(data.user.id);

            return { success: true, user: userSession };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    static async signOut() {
        try {
            // Clear local session
            localStorage.removeItem('admin_session');
            localStorage.removeItem('session_expires');
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    static async getCurrentUser() {
        try {
            const sessionData = localStorage.getItem('admin_session');
            const sessionExpires = localStorage.getItem('session_expires');
            
            console.log('🔍 getCurrentUser Debug:', {
                hasSessionData: !!sessionData,
                hasSessionExpires: !!sessionExpires,
                sessionData: sessionData ? JSON.parse(sessionData) : null,
                expiresAt: sessionExpires ? new Date(parseInt(sessionExpires)) : null,
                currentTime: new Date(),
                isExpired: sessionExpires ? Date.now() > parseInt(sessionExpires) : 'unknown'
            });
            
            if (!sessionData || !sessionExpires) {
                console.log('❌ No session data found');
                return { success: false, user: null };
            }

            // Check if session is expired
            if (Date.now() > parseInt(sessionExpires)) {
                console.log('❌ Session expired, clearing...');
                this.signOut();
                return { success: false, user: null };
            }

            const user = JSON.parse(sessionData);
            console.log('✅ Session valid, user:', user);
            return { success: true, user };
        } catch (error) {
            console.error('❌ Get user error:', error);
            console.log('🧹 Clearing corrupted session...');
            this.signOut(); // Clear corrupted session
            return { success: false, error: error.message };
        }
    }

    static async updateLastLogin(userId) {
        try {
            await supabaseClient
                .from('admin_users')
                .update({ 
                    last_login: new Date().toISOString(),
                    failed_login_attempts: 0,
                    locked_until: null
                })
                .eq('id', userId);
        } catch (error) {
            console.error('Update last login error:', error);
        }
    }

    static async checkAuthAndRedirect() {
        const { user } = await this.getCurrentUser();
        if (!user && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static isLoggedIn() {
        const sessionData = localStorage.getItem('admin_session');
        const sessionExpires = localStorage.getItem('session_expires');
        
        return sessionData && sessionExpires && Date.now() < parseInt(sessionExpires);
    }
}

// Database Helper Functions
class DatabaseService {
    // Banks
    static async getBanks() {
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

    static async createBank(name) {
        try {
            const { data, error } = await supabaseClient
                .from('banks')
                .insert([{ name }])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create bank error:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateBank(id, name) {
        try {
            const { data, error } = await supabaseClient
                .from('banks')
                .update({ name, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update bank error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteBank(id) {
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

    // Agents
    static async getAgents() {
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

    static async createAgent(agent) {
        try {
            const { data, error } = await supabaseClient
                .from('agents')
                .insert([agent])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create agent error:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateAgent(id, agent) {
        try {
            const { data, error } = await supabaseClient
                .from('agents')
                .update({ ...agent, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update agent error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteAgent(id) {
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

    // Bankers
    static async getBankers() {
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

    static async createBanker(banker) {
        try {
            const { data, error } = await supabaseClient
                .from('bankers')
                .insert([banker])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create banker error:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateBanker(id, banker) {
        try {
            const { data, error } = await supabaseClient
                .from('bankers')
                .update({ ...banker, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update banker error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteBanker(id) {
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

    // Rate Types
    static async getRateTypes() {
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

    static async createRateType(rateType) {
        try {
            const { data, error } = await supabaseClient
                .from('rate_types')
                .insert([rateType])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create rate type error:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateRateType(id, rateType) {
        try {
            const { data, error } = await supabaseClient
                .from('rate_types')
                .update({ ...rateType, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update rate type error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteRateType(id) {
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

    // Rate Packages
    static async getRatePackages() {
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

    static async createRatePackage(ratePackage) {
        try {
            const { data, error } = await supabaseClient
                .from('rate_packages')
                .insert([ratePackage])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create rate package error:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateRatePackage(id, ratePackage) {
        try {
            const { data, error } = await supabaseClient
                .from('rate_packages')
                .update({ ...ratePackage, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update rate package error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteRatePackage(id) {
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

    // Enquiries
    static async getEnquiries() {
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

    static async updateEnquiryStatus(id, status) {
        try {
            const { data, error } = await supabaseClient
                .from('enquiries')
                .update({ status, updated_at: new Date() })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update enquiry status error:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteEnquiry(id) {
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
}

// Loading State Helper
class LoadingService {
    static show(message = 'Loading...') {
        // Remove existing loader
        this.hide();
        
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
                    <div style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid #e2e8f0;
                        border-top: 2px solid #4338ca;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <span style="color: #374151; font-weight: 500;">${message}</span>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
    }

    static hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
        }
    }

    static async withLoading(asyncFunction, message = 'Loading...') {
        this.show(message);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            this.hide();
        }
    }
}

// Utility Functions
class Utils {
    static showSuccess(message) {
        this.showNotification(message, 'success');
    }

    static showError(message) {
        this.showNotification(message, 'error');
    }

    static showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const colors = {
            success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
            error: { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' },
            info: { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' }
        };

        const color = colors[type] || colors.info;

        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${color.bg};
                border: 1px solid ${color.border};
                color: ${color.text};
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            ">
                ${message}
            </div>
            <style>
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-SG', {
            style: 'currency',
            currency: 'SGD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-SG');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('en-SG');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, DatabaseService, LoadingService, Utils };
}