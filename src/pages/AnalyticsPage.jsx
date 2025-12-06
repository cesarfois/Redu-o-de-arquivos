import { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import AnalyticsDashboard from '../components/Features/AnalyticsDashboard';
import { docuwareService } from '../services/docuwareService';

const AnalyticsPage = () => {
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinetId, setSelectedCabinetId] = useState(localStorage.getItem('selectedCabinetId') || '');
    const [loadingCabinets, setLoadingCabinets] = useState(true);

    // Fetch cabinets on mount
    useEffect(() => {
        const fetchCabinets = async () => {
            try {
                const fetchedCabinets = await docuwareService.getCabinets();
                const sortedCabinets = fetchedCabinets.sort((a, b) => a.Name.localeCompare(b.Name));
                setCabinets(sortedCabinets);
                // Auto-selection removed
            } catch (error) {
                console.error('Error fetching cabinets:', error);
            } finally {
                setLoadingCabinets(false);
            }
        };

        fetchCabinets();
    }, []);

    const handleCabinetChange = (e) => {
        const newId = e.target.value;
        setSelectedCabinetId(newId);
        if (newId) {
            localStorage.setItem('selectedCabinetId', newId);
        } else {
            localStorage.removeItem('selectedCabinetId');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Navbar />

            <main className="flex-1 container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Visual Analytics</h1>

                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text font-bold">Select Cabinet</span>
                            </label>
                            {loadingCabinets ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    <span className="text-sm text-gray-500">Loading cabinets...</span>
                                </div>
                            ) : (
                                <select
                                    className="select select-bordered"
                                    value={selectedCabinetId}
                                    onChange={handleCabinetChange}
                                >
                                    {cabinets.map((cabinet) => (
                                        <option key={cabinet.Id} value={cabinet.Id}>
                                            {cabinet.Name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {selectedCabinetId ? (
                    <AnalyticsDashboard cabinetId={selectedCabinetId} />
                ) : (
                    <div className="p-10 text-center text-gray-500">
                        Please select a cabinet to view analytics.
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AnalyticsPage;
