import { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import SearchForm from '../components/Features/SearchForm';
import ResultsTable from '../components/Features/ResultsTable';
import LogConsole from '../components/Features/LogConsole';
import { docuwareService } from '../services/docuwareService';

const DashboardPage = () => {
    const [results, setResults] = useState([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [logs, setLogs] = useState([]);
    const [cabinetId, setCabinetId] = useState('');

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    };

    const handleCabinetSelect = async (selectedCabinetId) => {
        try {
            setCabinetId(selectedCabinetId);
            setResults([]); // Clear previous results
            setTotalDocs(0);

            if (selectedCabinetId) {
                addLog(`Cabinet selected: ${selectedCabinetId}. Fetching total count...`);
                const count = await docuwareService.getCabinetCount(selectedCabinetId);
                setTotalCount(count);
                addLog(`Total documents in cabinet: ${count}`);
            } else {
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching cabinet count:', error);
            addLog(`❌ Error fetching total count: ${error.message}`);
        }
    };

    const handleSearch = async (selectedCabinetId, filters) => {
        try {
            // Note: cabinetId state might arguably be set here too, or relying on handleCabinetSelect
            if (selectedCabinetId !== cabinetId) {
                setCabinetId(selectedCabinetId);
            }
            addLog(`Searching cabinet ${selectedCabinetId} with ${filters.length} filter(s)...`);

            if (filters.length > 0) {
                filters.forEach(f => {
                    addLog(`  - ${f.fieldName} = "${f.value}"`);
                });
            }

            const response = await docuwareService.searchDocuments(selectedCabinetId, filters);
            setResults(response.items);
            setTotalDocs(response.total);
            addLog(`✅ Found ${response.items.length} documents (Total available: ${response.total})`);
        } catch (error) {
            addLog(`❌ Search failed: ${error.message}`);
            console.error('Search error:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Navbar />

            <main className="flex-1 container mx-auto p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold">DocuWare Dashboard</h1>
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <LogConsole logs={logs} />
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                    <SearchForm
                        onSearch={handleSearch}
                        onLog={addLog}
                        totalCount={totalCount}
                        onCabinetChange={handleCabinetSelect}
                    />
                </div>

                <ResultsTable results={results} totalDocs={totalDocs} cabinetId={cabinetId} />
            </main>

            <Footer />
        </div>
    );
};

export default DashboardPage;
