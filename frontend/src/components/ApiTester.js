import React, { useState, useEffect } from 'react';
import './ApiTester.css';

const ApiTester = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use relative API paths so requests route through nginx when the app is served at http://localhost.
  const getApiBaseUrl = () => {
    return '/api';
  };

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const url = `${apiBaseUrl}/health`;
      console.log('Request URL:', url);
      const response = await fetch(url);
      const text = await response.text();
      console.log('Backend response:', text);
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error('Backend returned invalid JSON');
      }
      setApiResponse(data);
      setApiStatus('online');
      setError(null);
    } catch (err) {
      setApiStatus('offline');
      setError(err.message);
      setApiResponse(null);
      console.error('API Error:', err);
    }
  };

  const handleTestExtraction = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${apiBaseUrl}/extract`;
      console.log('Request URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://remoteok.com/remote-jobs',
        }),
      });
      const text = await response.text();
      console.log('Backend response:', text);
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error('Backend returned invalid JSON');
      }
      setApiResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <div className="status-card">
        <div className={`status-indicator ${apiStatus}`}></div>
        <div className="status-content">
          <h2>Backend API Status</h2>
          <p className={`status-text ${apiStatus}`}>
            {apiStatus === 'checking' ? '🔄 Checking...' : apiStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
      </div>

      {apiResponse && (
        <div className="response-card">
          <h3>API Response</h3>
          <div className="response-content">
            <p><strong>Message:</strong> {apiResponse.message}</p>
            <p><strong>Version:</strong> {apiResponse.version}</p>
            <p><strong>Docs:</strong> <a href={apiResponse.docs} target="_blank" rel="noopener noreferrer">{apiResponse.docs}</a></p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-card">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="features-grid">
        <div className="feature-card">
          <h3>🔍 Extract Data</h3>
          <p>Extract structured data from web pages using CSS selectors</p>
          <button 
            onClick={handleTestExtraction}
            disabled={apiStatus !== 'online' || loading}
            className="btn"
          >
            {loading ? 'Processing...' : 'Test Extraction'}
          </button>
        </div>

        <div className="feature-card">
          <h3>📋 Validate</h3>
          <p>Validate extracted data against defined schemas</p>
          <button className="btn" disabled>Coming Soon</button>
        </div>

        <div className="feature-card">
          <h3>🔄 Normalize</h3>
          <p>Normalize data to ensure consistency</p>
          <button className="btn" disabled>Coming Soon</button>
        </div>

        <div className="feature-card">
          <h3>📊 Monitor</h3>
          <p>Monitor extraction jobs and performance metrics</p>
          <button className="btn" disabled>Coming Soon</button>
        </div>
      </div>

      <div className="quick-links">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/docs" target="_blank" rel="noopener noreferrer">📚 API Documentation</a></li>
          <li><a href="/redoc" target="_blank" rel="noopener noreferrer">📖 ReDoc</a></li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTester;
