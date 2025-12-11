import { useEffect, useRef } from 'react';

const LogConsole = ({ logs, className = "" }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className={`mockup-code bg-black text-green-400 h-full overflow-y-auto text-[10px] py-1 leading-tight ${className}`}>
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
