/**
 * RNK™ Subscription Verification Library
 * Patreon-based subscription verification for premium Foundry VTT modules
 * @version 1.0.0
 * @author Asgard Innovations
 */

class RNKVerification {
  constructor(moduleId, moduleName) {
    this.moduleId = moduleId;
    this.moduleName = moduleName;
    this.apiBase = 'https://verify.asgard-innovations.store/api';
    this.storageKey = `rnk_verification_${moduleId}`;
    this.gracePeriodDays = 7;
    this.isVerified = false;
    this.verificationData = null;
  }

  /**
   * Initialize verification check on module load
   * @returns {Promise<boolean>} - True if verified, false otherwise
   */
  async initialize() {
    console.log(`RNK™ | Initializing verification for ${this.moduleName}`);

    // Check local storage first
    const cached = this.getCachedVerification();
    if (cached) {
      if (this.isCacheValid(cached)) {
        console.log(`RNK™ | Using cached verification for ${this.moduleName}`);
        this.isVerified = cached.verified;
        this.verificationData = cached;
        return this.isVerified;
      }
    }

    // Attempt online verification
    try {
      const result = await this.verifyOnline();
      if (result.verified) {
        this.isVerified = true;
        this.verificationData = result;
        this.cacheVerification(result);
        return true;
      }
    } catch (error) {
      console.warn(`RNK™ | Online verification failed: ${error.message}`);
      
      // Check grace period
      if (cached && this.isWithinGracePeriod(cached)) {
        console.log(`RNK™ | Using grace period for ${this.moduleName}`);
        this.isVerified = cached.verified;
        this.verificationData = cached;
        return this.isVerified;
      }
    }

    // Verification failed - show activation UI
    this.isVerified = false;
    this.showActivationUI();
    return false;
  }

  /**
   * Verify subscription online with API
   * @returns {Promise<Object>} - Verification result
   */
  async verifyOnline() {
    const token = this.getAccessToken();
    const patreonId = this.getPatreonId();

    const response = await fetch(`${this.apiBase}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patreonId: patreonId || null,
        moduleId: this.moduleId,
        accessToken: token || null
      })
    });

    if (!response.ok) {
      throw new Error(`Verification API returned ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Initiate Patreon OAuth flow
   */
  initiateOAuth() {
    const clientId = 'uHrLjO42vjfHmUgjvJicLKSOUBVdUfeYMJetAtpPPezwUI-YbXr8d0KNthRI3BPW';
    const redirectUri = encodeURIComponent(`${this.apiBase}/auth/patreon/callback`);
    const scope = encodeURIComponent('identity identity[email] campaigns campaigns.members');
    
    const oauthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.open(oauthUrl, 'patreon-auth', 'width=600,height=800');
    
    // Listen for OAuth completion
    window.addEventListener('message', this.handleOAuthCallback.bind(this));
  }

  /**
   * Handle OAuth callback message
   */
  async handleOAuthCallback(event) {
    if (event.data && event.data.type === 'rnk-oauth-success') {
      console.log('RNK™ | OAuth completed successfully');
      
      // Store tokens
      this.setAccessToken(event.data.accessToken);
      this.setPatreonId(event.data.patreonId);
      
      // Re-verify
      const result = await this.initialize();
      if (result) {
        ui.notifications.info(`${this.moduleName} activated successfully!`);
        this.hideActivationUI();
        
        // Reload to apply verification
        window.location.reload();
      }
    }
  }

  /**
   * Show activation UI dialog
   */
  showActivationUI() {
    // Check if dialog already exists
    if (document.getElementById('rnk-verification-dialog')) {
      return;
    }

    const dialog = document.createElement('div');
    dialog.id = 'rnk-verification-dialog';
    dialog.className = 'rnk-verification-overlay';
    dialog.innerHTML = `
      <div class="rnk-verification-modal">
        <div class="rnk-verification-header">
          <h2>🔒 ${this.moduleName} - Activation Required</h2>
        </div>
        <div class="rnk-verification-content">
          <p>This is a premium RNK™ module that requires an active Patreon subscription.</p>
          
          <div class="rnk-verification-features">
            <h3>Premium Support Includes:</h3>
            <ul>
              <li>✓ Priority bug fixes and feature requests</li>
              <li>✓ Early access to new modules and updates</li>
              <li>✓ Direct support from the developer</li>
              <li>✓ Support independent Foundry VTT development</li>
            </ul>
          </div>

          <div class="rnk-verification-actions">
            <a href="https://patreon.com/RagNaroks" target="_blank" class="rnk-btn rnk-btn-primary">
              <span class="rnk-icon">❤️</span> Support on Patreon
            </a>
            <button id="rnk-activate-btn" class="rnk-btn rnk-btn-secondary">
              <span class="rnk-icon">🔓</span> I'm Already a Patron - Activate
            </button>
          </div>

          <div class="rnk-verification-footer">
            <p><small>Need help? Visit <a href="https://github.com/RNK-Enterprise/${this.moduleId}-public/issues" target="_blank">GitHub</a></small></p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Add event listener for activate button
    document.getElementById('rnk-activate-btn').addEventListener('click', () => {
      this.initiateOAuth();
    });

    // Inject styles if not already present
    if (!document.getElementById('rnk-verification-styles')) {
      this.injectStyles();
    }
  }

  /**
   * Hide activation UI dialog
   */
  hideActivationUI() {
    const dialog = document.getElementById('rnk-verification-dialog');
    if (dialog) {
      dialog.remove();
    }
  }

  /**
   * Inject verification UI styles
   */
  injectStyles() {
    const style = document.createElement('style');
    style.id = 'rnk-verification-styles';
    style.textContent = `
      .rnk-verification-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      }

      .rnk-verification-modal {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #ff6b6b;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: rnk-fade-in 0.3s ease-out;
      }

      @keyframes rnk-fade-in {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .rnk-verification-header {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        padding: 20px;
        border-radius: 10px 10px 0 0;
        text-align: center;
      }

      .rnk-verification-header h2 {
        margin: 0;
        color: white;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .rnk-verification-content {
        padding: 30px;
        color: #e0e0e0;
      }

      .rnk-verification-content p {
        margin: 0 0 20px 0;
        font-size: 16px;
        line-height: 1.6;
      }

      .rnk-verification-features {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #ff6b6b;
      }

      .rnk-verification-features h3 {
        margin: 0 0 15px 0;
        color: #ff6b6b;
        font-size: 18px;
      }

      .rnk-verification-features ul {
        margin: 0;
        padding-left: 20px;
      }

      .rnk-verification-features li {
        margin: 10px 0;
        font-size: 15px;
      }

      .rnk-verification-actions {
        display: flex;
        gap: 15px;
        margin: 25px 0;
        flex-wrap: wrap;
      }

      .rnk-btn {
        flex: 1;
        min-width: 200px;
        padding: 15px 25px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .rnk-btn-primary {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      }

      .rnk-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
      }

      .rnk-btn-secondary {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
      }

      .rnk-btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 144, 226, 0.6);
      }

      .rnk-icon {
        font-size: 20px;
      }

      .rnk-verification-footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .rnk-verification-footer a {
        color: #4a90e2;
        text-decoration: none;
      }

      .rnk-verification-footer a:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get cached verification data
   * @returns {Object|null}
   */
  getCachedVerification() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('RNK™ | Failed to read cache:', error);
      return null;
    }
  }

  /**
   * Cache verification data
   * @param {Object} data - Verification result
   */
  cacheVerification(data) {
    try {
      const cacheData = {
        ...data,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('RNK™ | Failed to cache verification:', error);
    }
  }

  /**
   * Check if cache is still valid (24 hours)
   * @param {Object} cached - Cached verification data
   * @returns {boolean}
   */
  isCacheValid(cached) {
    if (!cached.cachedAt) return false;
    
    const cacheTime = new Date(cached.cachedAt);
    const now = new Date();
    const hoursSinceCached = (now - cacheTime) / (1000 * 60 * 60);
    
    return hoursSinceCached < 24;
  }

  /**
   * Check if within grace period
   * @param {Object} cached - Cached verification data
   * @returns {boolean}
   */
  isWithinGracePeriod(cached) {
    if (!cached.expiresAt) return false;
    
    const expiresAt = new Date(cached.expiresAt);
    const now = new Date();
    
    return now < expiresAt;
  }

  /**
   * Get stored access token
   * @returns {string|null}
   */
  getAccessToken() {
    return localStorage.getItem('rnk_access_token');
  }

  /**
   * Set access token
   * @param {string} token
   */
  setAccessToken(token) {
    localStorage.setItem('rnk_access_token', token);
  }

  /**
   * Get stored Patreon ID
   * @returns {string|null}
   */
  getPatreonId() {
    return localStorage.getItem('rnk_patreon_id');
  }

  /**
   * Set Patreon ID
   * @param {string} id
   */
  setPatreonId(id) {
    localStorage.setItem('rnk_patreon_id', id);
  }

  /**
   * Clear verification data (for debugging)
   */
  clearVerification() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('rnk_access_token');
    localStorage.removeItem('rnk_patreon_id');
    console.log('RNK™ | Verification data cleared');
  }
}

// Export for module use
window.RNKVerification = RNKVerification;
