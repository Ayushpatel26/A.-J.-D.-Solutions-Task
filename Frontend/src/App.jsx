import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const disabled = loading || urls.length < 3;

  const handleInputChange = (event) => {
    setUrls(event.target.value);
  };

  const isValidURL = (url) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +                        // Protocol (http or https)
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' +              // OR IPv4 address
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' +       // Port and path
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' +              // Query string
      '(\\#[-a-zA-Z\\d_]*)?$', 'i'                  // Fragment locator
    );
    return !!pattern.test(url);
  };

  const handleSubmit = async () => {
    if (!urls.trim()) {
      toast.error('Please provide at least one URL');
      return;
    };

    const urlList = urls.trim().split(/\s+/);

    const allUrlValid = urlList.every(isValidURL);

    if (!allUrlValid) {
      toast.error('One or more URLs are invalid. Please check your input.');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await axios.post('http://localhost:5000/api/scrape', {
        urls,
      });

      setResults(response.data.results);
      console.log(response);
      toast.error(response.data.results[0].error);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Web Page Content Analyzer</h1>

      <div className="w-full max-w-lg">
        <textarea
          value={urls}
          onChange={handleInputChange}
          placeholder="Enter URLs separated by space..."
          className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows="4"
        ></textarea>
        <button
          onClick={handleSubmit}
          className={`w-full text-white py-2 rounded-md transition-colors duration-200 ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={disabled}
        >
          {loading ? 'Processing...' : 'Analyze URLs'}
        </button>
      </div>

      {loading && (
        <div className="mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-blue-600">Loading...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="w-full max-w-4xl mt-10 overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-6 text-left">URL</th>
                <th className="py-3 px-6 text-center">Total Readable Text</th>
                <th className="py-3 px-6 text-center">Blog/Article Content Text</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-6">{result.url}</td>
                  <td className="py-2 px-6 text-center">{result.totalReadableText}</td>
                  <td className="py-2 px-6 text-center">{result.blogContentText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default App;
