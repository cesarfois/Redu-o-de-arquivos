import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const AnalyticsDashboard = ({ results }) => {
    const [selectedField, setSelectedField] = useState('');
    const [availableFields, setAvailableFields] = useState([]);

    // Extract available fields from results
    useEffect(() => {
        if (!results || results.length === 0) {
            setAvailableFields([]);
            return;
        }

        const firstDoc = results[0];
        const fields = [];

        // Standard fields
        fields.push({ name: 'ContentType', label: 'Content Type' });
        // fields.push({ name: 'Author', label: 'Author' }); // Add if available

        // Custom fields
        if (firstDoc.Fields && Array.isArray(firstDoc.Fields)) {
            firstDoc.Fields.forEach(field => {
                if (!field.SystemField && field.DWFieldType !== 'Memo' && field.ItemElementName !== 'Date') {
                    // Exclude Dates and Memos for pie charts usually, but we can allow them if needed.
                    // User specifically mentioned "Tipo de Documento", "Estatuto", "Categoria".
                    // These are usually keyword/text fields.
                    fields.push({
                        name: field.FieldName,
                        label: field.FieldLabel || field.FieldName
                    });
                }
            });
        }

        // Remove duplicates if any
        const uniqueFields = Array.from(new Set(fields.map(f => f.name)))
            .map(name => fields.find(f => f.name === name));

        setAvailableFields(uniqueFields);

        // Auto-select first field if nothing selected or current selection invalid
        if (!selectedField && uniqueFields.length > 0) {
            setSelectedField(uniqueFields[0].name);
        }
    }, [results, selectedField]);

    const getFieldValue = (doc, fieldName) => {
        // Check standard first
        if (doc[fieldName] !== undefined) return doc[fieldName];

        // Check custom fields
        if (doc.Fields && Array.isArray(doc.Fields)) {
            const field = doc.Fields.find(f => f.FieldName === fieldName);
            if (field) {
                return field.Item || field.ItemElementName || 'Unknown';
            }
        }
        return 'Unknown';
    };

    // Process data for chart
    const chartData = useMemo(() => {
        if (!selectedField || results.length === 0) return [];

        const counts = {};
        let total = 0;

        results.forEach(doc => {
            const value = getFieldValue(doc, selectedField);
            const key = value ? String(value) : 'Empty';
            counts[key] = (counts[key] || 0) + 1;
            total++;
        });

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
            percent: (counts[key] / total) * 100
        })).sort((a, b) => b.value - a.value); // Sort descending

    }, [results, selectedField]);


    if (!results || results.length === 0) {
        return null; // hide if no results
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-base-100 p-2 border border-base-300 shadow-xl rounded text-sm">
                    <p className="font-bold mb-1">{data.name}</p>
                    <p>Count: <span className="font-mono">{data.value}</span></p>
                    <p>Percent: <span className="font-mono">{data.percent.toFixed(1)}%</span></p>
                </div>
            );
        }
        return null;
    };

    // Custom Legend to show percentages
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto w-48 text-xs p-2">
                {
                    payload.map((entry, index) => {
                        const dataItem = chartData.find(d => d.name === entry.value);
                        const percent = dataItem ? dataItem.percent.toFixed(1) : 0;
                        return (
                            <li key={`item-${index}`} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="flex-1 truncate" title={entry.value}>{entry.value}</span>
                                <span className="font-bold opacity-70">{percent}%</span>
                            </li>
                        )
                    })
                }
            </ul>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="card-title text-lg">
                        📊 Analytics
                        <div className="badge badge-neutral badge-sm">{results.length} docs</div>
                    </h2>

                    <div className="form-control w-full max-w-xs">
                        <label className="label py-0">
                            <span className="label-text-alt">Group By</span>
                        </label>
                        <select
                            className="select select-bordered select-sm"
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                        >
                            {availableFields.map(field => (
                                <option key={field.name} value={field.name}>
                                    {field.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
