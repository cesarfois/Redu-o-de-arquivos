import { useState, useEffect } from 'react';
import { docuwareService } from '../../services/docuwareService';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const SearchForm = ({ onSearch, onLog }) => {
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState('');
    const [fields, setFields] = useState([]);
    const [filters, setFilters] = useState([{ fieldName: '', value: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCabinets();
    }, []);

    useEffect(() => {
        if (selectedCabinet) {
            fetchFields();
        }
    }, [selectedCabinet]);

    const fetchCabinets = async () => {
        try {
            setLoading(true);
            onLog('Fetching file cabinets...');
            const data = await docuwareService.getCabinets();
            setCabinets(data);
            onLog(`Found ${data.length} file cabinets`);
        } catch (err) {
            setError('Failed to load cabinets: ' + err.message);
            onLog('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFields = async () => {
        try {
            setLoading(true);
            onLog(`Fetching fields for cabinet ${selectedCabinet}...`);
            const data = await docuwareService.getCabinetFields(selectedCabinet);
            // Filter to show only user-visible fields (not system fields)
            const userFields = data.filter(f => !f.SystemField && f.DWFieldType !== 'Memo');
            setFields(userFields);
            onLog(`Found ${userFields.length} searchable fields`);
        } catch (err) {
            setError('Failed to load fields: ' + err.message);
            onLog('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFilter = () => {
        setFilters([...filters, { fieldName: '', value: '' }]);
    };

    const handleRemoveFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleFilterChange = (index, field, value) => {
        const newFilters = [...filters];
        newFilters[index][field] = value;
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!selectedCabinet) {
            setError('Please select a file cabinet');
            return;
        }

        // Filter out empty filters
        const validFilters = filters.filter(f => f.fieldName && f.value);

        onLog(`Searching in cabinet ${selectedCabinet} with ${validFilters.length} filters...`);
        onSearch(selectedCabinet, validFilters);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Search Documents</h2>

                {error && <ErrorMessage message={error} />}

                {/* Cabinet Selection */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">File Cabinet</span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={selectedCabinet}
                        onChange={(e) => setSelectedCabinet(e.target.value)}
                    >
                        <option value="">Select a cabinet...</option>
                        {cabinets.map((cab) => (
                            <option key={cab.Id} value={cab.Id}>
                                {cab.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filters */}
                {selectedCabinet && fields.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label">
                                <span className="label-text font-semibold">Filters</span>
                            </label>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={handleAddFilter}
                            >
                                + Add Filter
                            </button>
                        </div>

                        {filters.map((filter, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <select
                                    className="select select-bordered flex-1"
                                    value={filter.fieldName}
                                    onChange={(e) => handleFilterChange(index, 'fieldName', e.target.value)}
                                >
                                    <option value="">Select field...</option>
                                    {fields.map((field) => (
                                        <option key={field.DBFieldName} value={field.DBFieldName}>
                                            {field.DisplayName || field.DBFieldName}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    className="input input-bordered flex-1"
                                    placeholder="Value..."
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                />

                                {filters.length > 1 && (
                                    <button
                                        className="btn btn-error btn-outline"
                                        onClick={() => handleRemoveFilter(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Search Button */}
                <div className="card-actions justify-end mt-4">
                    <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                        disabled={!selectedCabinet}
                    >
                        Search Documents
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchForm;
