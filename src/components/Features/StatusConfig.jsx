import { useState } from 'react';

const StatusConfig = ({ fields, onConfigChange, customTrigger }) => {
    const [selectedField, setSelectedField] = useState('');
    const [statusRules, setStatusRules] = useState([
        { value: '', color: 'green', label: '🟢 Green' },
        { value: '', color: 'yellow', label: '🟡 Yellow' },
        { value: '', color: 'red', label: '🔴 Red' }
    ]);

    const colorOptions = [
        { value: 'green', label: '🟢 Green', class: 'bg-green-500' },
        { value: 'yellow', label: '🟡 Yellow', class: 'bg-yellow-500' },
        { value: 'red', label: '🔴 Red', class: 'bg-red-500' },
        { value: 'blue', label: '🔵 Blue', class: 'bg-blue-500' },
        { value: 'gray', label: '⚪ Gray', class: 'bg-gray-500' }
    ];

    const handleAddRule = () => {
        setStatusRules([...statusRules, { value: '', color: 'gray', label: '⚪ Gray' }]);
    };

    const handleRemoveRule = (index) => {
        setStatusRules(statusRules.filter((_, i) => i !== index));
    };

    const handleRuleChange = (index, field, value) => {
        const newRules = [...statusRules];
        newRules[index][field] = value;
        if (field === 'color') {
            const colorOption = colorOptions.find(c => c.value === value);
            newRules[index].label = colorOption.label;
        }
        setStatusRules(newRules);
    };

    const handleApply = () => {
        if (!selectedField) {
            alert('Please select a field');
            return;
        }

        const validRules = statusRules.filter(r => r.value.trim() !== '');
        if (validRules.length === 0) {
            alert('Please add at least one status rule');
            return;
        }

        const config = {
            field: selectedField,
            rules: validRules
        };

        onConfigChange(config);
        document.getElementById('status_modal').close();
    };

    const handleClear = () => {
        onConfigChange(null);
        setSelectedField('');
        setStatusRules([
            { value: '', color: 'green', label: '🟢 Green' },
            { value: '', color: 'yellow', label: '🟡 Yellow' },
            { value: '', color: 'red', label: '🔴 Red' }
        ]);
        document.getElementById('status_modal').close();
    };

    const openModal = () => {
        document.getElementById('status_modal').showModal();
    };

    return (
        <>
            {customTrigger ? (
                customTrigger(openModal)
            ) : (
                <button className="btn btn-sm btn-outline" onClick={openModal}>
                    🚦 Status Indicator
                </button>
            )}

            <dialog id="status_modal" className="modal">
                <div className="modal-box w-11/12 max-w-md">
                    <h3 className="font-bold text-lg mb-4">Configure Status Indicator</h3>

                    {/* Field Selection */}
                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text">Select Field</span>
                        </label>
                        <select
                            className="select select-bordered select-sm"
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                        >
                            <option value="">Choose a field...</option>
                            {fields.map((field) => (
                                <option key={field.name} value={field.name}>
                                    {field.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Rules */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label">
                                <span className="label-text font-semibold">Status Rules</span>
                            </label>
                            <button
                                className="btn btn-xs btn-outline"
                                onClick={handleAddRule}
                            >
                                + Add
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {statusRules.map((rule, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="input input-bordered input-sm flex-1"
                                        placeholder="Value (e.g., Aprovado)"
                                        value={rule.value}
                                        onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                                    />

                                    <select
                                        className="select select-bordered select-sm w-32"
                                        value={rule.color}
                                        onChange={(e) => handleRuleChange(index, 'color', e.target.value)}
                                    >
                                        {colorOptions.map((color) => (
                                            <option key={color.value} value={color.value}>
                                                {color.label}
                                            </option>
                                        ))}
                                    </select>

                                    {statusRules.length > 1 && (
                                        <button
                                            className="btn btn-xs btn-error btn-outline"
                                            onClick={() => handleRemoveRule(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-action">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={() => document.getElementById('status_modal').close()}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={handleApply}
                        >
                            Apply
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
};

export default StatusConfig;
