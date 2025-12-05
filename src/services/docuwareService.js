import api from './api';

export const docuwareService = {
    // 1. Get File Cabinets
    getCabinets: async () => {
        const response = await api.get('/FileCabinets');
        return response.data.FileCabinet || [];
    },

    // 2. Get File Cabinet Fields (for filtering)
    getCabinetFields: async (cabinetId) => {
        const response = await api.get(`/FileCabinets/${cabinetId}`);
        return response.data.Fields || [];
    },

    // 3. Get Dialogs for a Cabinet
    getDialogs: async (cabinetId) => {
        const response = await api.get(`/FileCabinets/${cabinetId}/Dialogs`);
        return response.data.Dialog || [];
    },

    // 4. Search Documents with Filters
    searchDocuments: async (cabinetId, filters = []) => {
        // If no filters, just list documents
        if (filters.length === 0) {
            const response = await api.get(`/FileCabinets/${cabinetId}/Documents`, {
                params: {
                    count: 1000,
                    calculateTotalCount: true
                }
            });

            const total = (typeof response.data.Count === 'object' && response.data.Count !== null)
                ? (response.data.Count.Value || 0)
                : (response.data.Count || 0);

            return {
                items: response.data.Items || [],
                total: total
            };
        }

        // Get the first search dialog (or use custom dialog)
        const dialogs = await docuwareService.getDialogs(cabinetId);
        const searchDialog = dialogs.find(d => d.Type === 'Search') || dialogs[0];

        if (!searchDialog) {
            throw new Error('No search dialog found for this cabinet');
        }

        // Build the search query
        const conditions = filters.map(filter => ({
            DBName: filter.fieldName,
            Value: [filter.value]
        }));

        const queryBody = {
            Condition: conditions,
            Operation: 'And',
            CalculateTotalCount: true
        };

        // Execute search using DialogExpression
        const response = await api.post(
            `/FileCabinets/${cabinetId}/Query/DialogExpression`,
            queryBody,
            {
                params: {
                    dialogId: searchDialog.Id,
                    count: 1000  // Increased from 50 to get more results
                }
            }
        );

        // Helper to extract count
        const getCount = (data) => {
            if (typeof data.Count === 'object' && data.Count !== null) {
                return data.Count.Value || 0;
            }
            return data.Count || 0;
        };

        return {
            items: response.data.Items || [],
            total: getCount(response.data)
        };
    },

    // 5. Get Document View URL
    getDocumentViewUrl: (cabinetId, documentId) => {
        // Get the base URL from session storage
        const authData = sessionStorage.getItem('docuware_auth');
        let baseUrl = 'https://rcsangola.docuware.cloud'; // Default fallback
        let orgId = 'bcb91903-58eb-49c6-8572-be5e3bb9611e'; // Default org ID

        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                baseUrl = parsed.url;
                // Try to get org ID if stored
                if (parsed.organizationId) {
                    orgId = parsed.organizationId;
                }
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }

        // DocuWare WebClient URL format:
        // https://{domain}/DocuWare/Platform/WebClient/{orgId}/Integration?fc={cabinetId}&did={docId}&p=V
        return `${baseUrl}/DocuWare/Platform/WebClient/${orgId}/Integration?fc=${cabinetId}&did=${documentId}&p=V`;
    },

    // 6. Download Document
    downloadDocument: async (cabinetId, documentId) => {
        const response = await api.get(
            `/FileCabinets/${cabinetId}/Documents/${documentId}/FileDownload`,
            { responseType: 'blob' }
        );
        return response.data;
    }
};
