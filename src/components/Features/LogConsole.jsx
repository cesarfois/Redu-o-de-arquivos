import { useEffect, useRef } from 'react';

const LogConsole = ({ logs }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="mockup-code mt-8 bg-black text-green-400 h-48 overflow-y-auto">
            {logs.map((log, index) => (
                <pre key={index} data-prefix=">">
                    <code>{log}</code>
                </pre>
            ))}
            <div ref={endRef} />
        </div>
    );
};

export default LogConsole;
