// ===================================
// SECURITY UTILITIES
// Enhanced security functions for XSS prevention and input validation
// ===================================

class SecurityUtils {
    // HTML Sanitization to prevent XSS
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    // Safe DOM manipulation - replaces innerHTML usage
    static safeSetHTML(element, html) {
        if (!element) return;
        
        // Clear existing content
        element.textContent = '';
        
        // Create a temporary element to parse HTML safely
        const temp = document.createElement('div');
        temp.innerHTML = this.sanitizeHTML(html);
        
        // Move children to target element
        while (temp.firstChild) {
            element.appendChild(temp.firstChild);
        }
    }

    // Safe text content setting
    static safeSetText(element, text) {
        if (!element) return;
        element.textContent = text || '';
    }

    // Email sanitization for case-insensitive login
    static sanitizeEmail(email) {
        if (!email || typeof email !== 'string') return '';
        return email.trim().toLowerCase();
    }

    // Input validation functions
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateLength(value, min, max) {
        if (!value) return false;
        const length = value.trim().length;
        return length >= min && length <= max;
    }

    static validateNumber(value, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    // Escape HTML special characters
    static escapeHTML(text) {
        if (typeof text !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return text.replace(/[&<>"'/`=]/g, m => map[m]);
    }

    // Rate limiting for form submissions
    static createRateLimiter(maxAttempts, timeWindow) {
        const attempts = new Map();
        
        return function(identifier) {
            const now = Date.now();
            const userAttempts = attempts.get(identifier) || [];
            
            // Remove old attempts outside time window
            const recentAttempts = userAttempts.filter(
                attempt => now - attempt < timeWindow
            );
            
            if (recentAttempts.length >= maxAttempts) {
                return false; // Rate limited
            }
            
            recentAttempts.push(now);
            attempts.set(identifier, recentAttempts);
            return true; // Allowed
        };
    }

    // Session Activity Tracking
    static sessionManager = {
        inactivityTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
        warningTimeout: 55 * 60 * 1000,   // 55 minutes - show warning
        checkInterval: 60 * 1000,          // Check every minute
        warningShown: false,
        intervalId: null,
        warningTimeoutId: null,

        // Initialize session monitoring
        init() {
            this.updateLastActivity();
            this.startMonitoring();
            this.attachActivityListeners();
        },

        // Update last activity timestamp
        updateLastActivity() {
            const now = Date.now();
            if (typeof SecurityUtils.secureStorage !== 'undefined') {
                SecurityUtils.secureStorage.set('last_activity', now);
            } else {
                localStorage.setItem('last_activity', now.toString());
            }
            this.resetWarning();
        },

        // Start monitoring for inactivity
        startMonitoring() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            this.intervalId = setInterval(() => {
                this.checkInactivity();
            }, this.checkInterval);
        },

        // Check if user has been inactive
        checkInactivity() {
            const lastActivity = this.getLastActivity();
            if (!lastActivity) return;

            const now = Date.now();
            const inactiveTime = now - lastActivity;

            // Show warning at 55 minutes
            if (inactiveTime >= this.warningTimeout && !this.warningShown) {
                this.showInactivityWarning();
            }

            // Auto logout at 60 minutes
            if (inactiveTime >= this.inactivityTimeout) {
                this.performAutoLogout();
            }
        },

        // Get last activity timestamp
        getLastActivity() {
            let lastActivity;
            if (typeof SecurityUtils.secureStorage !== 'undefined') {
                lastActivity = SecurityUtils.secureStorage.get('last_activity');
            } else {
                lastActivity = localStorage.getItem('last_activity');
            }
            return lastActivity ? parseInt(lastActivity) : null;
        },

        // Show inactivity warning
        showInactivityWarning() {
            this.warningShown = true;

            // Create warning modal
            const warningModal = document.createElement('div');
            warningModal.id = 'session-timeout-warning';
            warningModal.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        background: white;
                        padding: 32px;
                        border-radius: 12px;
                        max-width: 400px;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    ">
                        <div style="
                            width: 48px;
                            height: 48px;
                            background: #fef3c7;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 16px;
                            color: #f59e0b;
                            font-size: 24px;
                        ">⚠️</div>
                        <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">Session Timeout Warning</h3>
                        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                            Your session will expire in <strong id="countdown">5:00</strong> due to inactivity.
                            Click "Stay Logged In" to continue your session.
                        </p>
                        <div style="display: flex; gap: 12px; justify-content: center;">
                            <button onclick="SecurityUtils.sessionManager.extendSession()" style="
                                background: #3b82f6;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                            ">Stay Logged In</button>
                            <button onclick="SecurityUtils.sessionManager.performAutoLogout()" style="
                                background: #e5e7eb;
                                color: #374151;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                            ">Sign Out Now</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(warningModal);
            this.startCountdown();
        },

        // Start countdown timer
        startCountdown() {
            let timeLeft = 5 * 60; // 5 minutes in seconds
            const countdownElement = document.getElementById('countdown');

            const countdownInterval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;

                if (countdownElement) {
                    countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }

                timeLeft--;

                if (timeLeft < 0) {
                    clearInterval(countdownInterval);
                    this.performAutoLogout();
                }
            }, 1000);
        },

        // Extend session (user clicked "Stay Logged In")
        extendSession() {
            this.updateLastActivity();
            this.removeWarningModal();
        },

        // Remove warning modal
        removeWarningModal() {
            const modal = document.getElementById('session-timeout-warning');
            if (modal) {
                modal.remove();
            }
            this.warningShown = false;
        },

        // Reset warning state
        resetWarning() {
            this.warningShown = false;
            this.removeWarningModal();
        },

        // Perform automatic logout
        async performAutoLogout() {
            try {
                console.log('🔒 Auto logout due to inactivity');

                // Clear monitoring
                this.stopMonitoring();

                // Sign out using AuthService if available
                if (typeof AuthService !== 'undefined') {
                    await AuthService.signOut();
                }

                // Clear all session data
                this.clearSessionData();

                // Show logout message
                this.showLogoutMessage();

                // Redirect to login after brief delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error('Auto logout error:', error);
                // Force redirect even if logout fails
                window.location.href = 'login.html';
            }
        },

        // Show logout message
        showLogoutMessage() {
            const message = document.createElement('div');
            message.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 20px 24px;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 25000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                ">
                    🔒 Session expired due to inactivity. Redirecting to login...
                </div>
            `;
            document.body.appendChild(message);
        },

        // Clear all session data
        clearSessionData() {
            if (typeof SecurityUtils.secureStorage !== 'undefined') {
                SecurityUtils.secureStorage.clear();
            }
            localStorage.clear();
            sessionStorage.clear();
        },

        // Stop monitoring
        stopMonitoring() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            if (this.warningTimeoutId) {
                clearTimeout(this.warningTimeoutId);
                this.warningTimeoutId = null;
            }
            this.removeWarningModal();
        },

        // Attach activity listeners
        attachActivityListeners() {
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

            events.forEach(event => {
                document.addEventListener(event, () => {
                    this.updateLastActivity();
                }, { passive: true });
            });

            // Also track page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.updateLastActivity();
                }
            });
        }
    };

    // Secure localStorage wrapper
    static secureStorage = {
        set(key, value, expirationMs = null) {
            const item = {
                value: value,
                timestamp: Date.now(),
                expiration: expirationMs ? Date.now() + expirationMs : null
            };
            
            try {
                localStorage.setItem(key, JSON.stringify(item));
                return true;
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                return false;
            }
        },

        get(key) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (!item) return null;
                
                // Check expiration
                if (item.expiration && Date.now() > item.expiration) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                return item.value;
            } catch (error) {
                console.error('Failed to read from localStorage:', error);
                return null;
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        },

        clear() {
            localStorage.clear();
        }
    };

    // Form validation wrapper
    static validateForm(formData, rules) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            
            if (rule.required && !this.validateRequired(value)) {
                errors.push(`${rule.label || field} is required`);
                continue;
            }
            
            if (value && rule.email && !this.validateEmail(value)) {
                errors.push(`${rule.label || field} must be a valid email`);
            }
            
            if (value && rule.length) {
                const { min, max } = rule.length;
                if (!this.validateLength(value, min, max)) {
                    errors.push(`${rule.label || field} must be between ${min} and ${max} characters`);
                }
            }
            
            if (value && rule.number) {
                const { min, max } = rule.number;
                if (!this.validateNumber(value, min, max)) {
                    errors.push(`${rule.label || field} must be a number between ${min} and ${max}`);
                }
            }
        }
        
        return errors;
    }
}

// Create rate limiter for login attempts
const loginRateLimiter = SecurityUtils.createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Export for global use
window.SecurityUtils = SecurityUtils;
window.loginRateLimiter = loginRateLimiter;

console.log('Security utilities loaded successfully');