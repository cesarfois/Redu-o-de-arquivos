import axios from 'axios';
import api from './api';

const AUTH_KEY = 'docuware_auth';

export const authService = {
    // 1. Login Function
    login: async (url, username, password) => {
        try {
            // Normalize URL (remove trailing slash and ensure https for cloud)
            let baseUrl = url.replace(/\/$/, '').trim();

            // Force HTTPS for DocuWare Cloud URLs
            if (baseUrl.includes('.docuware.cloud') && baseUrl.startsWith('http://')) {
                baseUrl = baseUrl.replace('http://', 'https://');
                console.warn('Automatically converted HTTP to HTTPS for DocuWare Cloud');
            }

            // Note: We keep baseURL as /DocuWare/Platform (proxy handles the rest)
            // We just store the user's URL for reference

            // Step 1: Get Identity Service URL
            console.log('Step 1: Getting Identity Service Info...');
            const serviceDesc = await api.get('/Home/IdentityServiceInfo');
            const identityUrl = serviceDesc.data.IdentityServiceUrl;
            console.log('Identity Service URL:', identityUrl);

            // Extract only the path part of the Identity URL (e.g. /bcb... )
            const identityPath = new URL(identityUrl).pathname;

            // Extract organization ID from the identity URL path
            // Format: /bcb91903-58eb-49c6-8572-be5e3bb9611e
            const orgId = identityPath.replace(/^\//, ''); // Remove leading slash
            console.log('Organization ID:', orgId);

            // Step 2: Get Token Endpoint from OpenID Configuration (via proxy to avoid CORS)
            console.log('Step 2: Getting OpenID Configuration...');
            const proxiedIdentity = `/docuware-proxy${identityPath}`;
            const discovery = await axios.get(`${proxiedIdentity}/.well-known/openid-configuration`);
            const tokenEndpoint = discovery.data.token_endpoint;
            console.log('Token Endpoint:', tokenEndpoint);

            // Extract only the path part of the Token Endpoint URL
            const tokenPath = new URL(tokenEndpoint).pathname;

            // Step 3: Request Access Token (also via proxy)
            console.log('Step 3: Requesting Access Token...');
            const proxiedToken = `/docuware-proxy${tokenPath}`;
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);
            params.append('client_id', 'docuware.platform.net.client');
            params.append('scope', 'docuware.platform');

            const tokenResponse = await axios.post(proxiedToken, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const accessToken = tokenResponse.data.access_token;
            console.log('✅ Authentication successful!');

            // Save to SessionStorage
            const authData = {
                token: accessToken,
                username: username,
                url: baseUrl,
                organizationId: orgId  // Save organization ID for document viewer URLs
            };
            sessionStorage.setItem(AUTH_KEY, JSON.stringify(authData));

            // Set default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return authData;
        } catch (error) {
            console.error('❌ Login failed:', error);

            // Provide more specific error messages
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (status === 400) {
                    throw new Error('Invalid credentials. Please check your username and password.');
                } else if (status === 401) {
                    throw new Error('Unauthorized. Please verify your credentials.');
                } else if (status === 404) {
                    throw new Error('Service not found. Please check your Platform URL.');
                } else {
                    throw new Error(`Server error (${status}): ${data.error_description || data.error || 'Unknown error'}`);
                }
            } else if (error.request) {
                throw new Error('Cannot reach DocuWare server. Please check your URL and internet connection.');
            } else {
                throw new Error(error.message || 'An unexpected error occurred.');
            }
        }
    },

    // 2. Logout Function
    logout: () => {
        sessionStorage.removeItem(AUTH_KEY);
        delete api.defaults.headers.common['Authorization'];
    },

    // 3. Get Current User (from storage)
    getCurrentUser: () => {
        const stored = sessionStorage.getItem(AUTH_KEY);
        if (stored) {
            const authData = JSON.parse(stored);
            // Restore header (baseURL stays as /DocuWare/Platform for proxy)
            api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
            return authData;
        }
        return null;
    }
};
