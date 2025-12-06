import { useEffect, useRef } from 'react';

const LogConsole = ({ logs }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="mockup-code bg-black text-green-400 h-14 overflow-y-auto text-[10px] py-1 leading-tight">
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
