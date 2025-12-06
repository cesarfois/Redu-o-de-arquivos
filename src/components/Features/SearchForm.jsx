import { useState, useEffect } from 'react';
import { docuwareService } from '../../services/docuwareService';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const SearchForm = ({ onSearch, onLog, totalCount = 0, onCabinetChange }) => {
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(localStorage.getItem('selectedCabinetId') || '');
    const [fields, setFields] = useState([]);
    const [suggestions, setSuggestions] = useState({}); // { [index]: [values] }
    const [filters, setFilters] = useState([{ fieldName: '', value: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCabinets();
        // Notify parent if we have a stored cabinet
        if (selectedCabinet && onCabinetChange) {
            onCabinetChange(selectedCabinet);
        }
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
            const sortedData = data.sort((a, b) => a.Name.localeCompare(b.Name));
            setCabinets(sortedData);
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
            const userFields = data
                .filter(f => !f.SystemField && f.DWFieldType !== 'Memo')
                .sort((a, b) => (a.DisplayName || a.FieldName).localeCompare(b.DisplayName || b.FieldName));
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
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setSelectedCabinet(newValue);

                            if (newValue) {
                                localStorage.setItem('selectedCabinetId', newValue);
                            } else {
                                localStorage.removeItem('selectedCabinetId');
                            }

                            if (onCabinetChange) {
                                onCabinetChange(newValue);
                            }
                        }}
                    >
                        <option value="">Selecione o armário</option>
                        {cabinets.map((cab) => (
                            <option key={cab.Id} value={cab.Id}>
                                {cab.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Total Count Display */}
                {selectedCabinet && (
                    <div className="alert alert-info py-2 mt-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Total Documents in Cabinet: <span className="font-bold">{totalCount}</span></span>
                    </div>
                )}

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
                                    onChange={async (e) => {
                                        const fieldName = e.target.value;
                                        handleFilterChange(index, 'fieldName', fieldName);
                                        // Clear value when field changes
                                        handleFilterChange(index, 'value', '');

                                        // Fetch suggestions
                                        if (fieldName && selectedCabinet) {
                                            try {
                                                const values = await docuwareService.getSelectList(selectedCabinet, fieldName);
                                                // Sort alphabetically ascending
                                                const sortedValues = values.sort((a, b) =>
                                                    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
                                                );

                                                // Store suggestions in specific state or just simple way? 
                                                // Simplified: use a temp state or modify filter object? 
                                                // Better: Use a separate state for suggestions mapping: { [index]: [] }
                                                setSuggestions(prev => ({ ...prev, [index]: sortedValues }));
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">Select field...</option>
                                    {fields.map((field) => (
                                        <option key={field.DBFieldName} value={field.DBFieldName}>
                                            {field.DisplayName || field.DBFieldName}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        list={`suggestions-${index}`}
                                        className="input input-bordered w-full"
                                        placeholder="Value..."
                                        value={filter.value}
                                        onFocus={async () => {
                                            // Load suggestions if empty and field is selected
                                            if (filter.fieldName && (!suggestions[index] || suggestions[index].length === 0)) {
                                                const values = await docuwareService.getSelectList(selectedCabinet, filter.fieldName);
                                                const sortedValues = values.sort((a, b) =>
                                                    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
                                                );
                                                setSuggestions(prev => ({ ...prev, [index]: sortedValues }));
                                            }
                                        }}
                                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                    />
                                    <datalist id={`suggestions-${index}`}>
                                        {suggestions[index]?.map((val, i) => (
                                            <option key={i} value={val} />
                                        ))}
                                    </datalist>
                                </div>

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
