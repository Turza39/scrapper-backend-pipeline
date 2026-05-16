import React, { useState, useRef } from 'react';
import './App.css';

function App() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const outputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const requestUrl = '/api/extract';
            console.log('Request URL:', requestUrl);
            const res = await fetch(requestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const text = await res.text();
            console.log('Backend response:', text);
            if (!res.ok) {
                throw new Error(`Backend returned status ${res.status}`);
            }
            try {
                const data = JSON.parse(text);
                setResult(data);
            } catch (parseError) {
                console.error('Invalid JSON response:', text);
                throw new Error('Backend returned invalid JSON');
            }
        } catch (err) {
            setError(err.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        const text = JSON.stringify(result, null, 2);
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            if (outputRef.current) {
                outputRef.current.select();
                document.execCommand('copy');
            }
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const text = JSON.stringify(result, null, 2);
        const blob = new Blob([text], { type: 'application/json' });
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = 'scraper-output.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlBlob);
    };

    return (
        <div className="app-root">
            <main className="panel">
                <h1>Scraper UI</h1>
                <p className="instructions">Enter a URL and click Run to request extraction from the backend.</p>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="input"
                    />
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Running...' : 'Run'}
                    </button>
                </form>

                {error && <div className="message error">Error: {error}</div>}

                <div className="output-section">
                    <label className="output-label">Output</label>
                    <textarea
                        ref={outputRef}
                        readOnly
                        className="output"
                        value={result ? JSON.stringify(result, null, 2) : ''}
                        placeholder="No output yet. Run an extraction to see results here."
                    />

                    <div className="output-actions">
                        <button onClick={handleCopy} className="action-btn" disabled={!result} type="button">
                            Copy
                        </button>
                        <button onClick={handleDownload} className="action-btn" disabled={!result} type="button">
                            Download
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
