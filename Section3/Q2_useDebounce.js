// ============================================
// Q2 — Custom React Hook: useDebounce
// Delays API calls by 300ms in search input
// ============================================

import { useState, useEffect } from 'react';

// ✅ THE HOOK
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Timer set karo
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: agar value change ho toh purana timer cancel karo
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

// ============================================
// USAGE EXAMPLE — Search Component
// ============================================

/*
import { useState, useEffect } from 'react';
import useDebounce from './Q2_useDebounce';

function SearchCampaigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced value — 300ms delay ke baad update hoga
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Sirf tab API call hogi jab debouncedSearch change ho
    if (debouncedSearch) {
      setLoading(true);
      fetch(`/api/campaigns?search=${debouncedSearch}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        });
    }
  }, [debouncedSearch]); // ← debouncedSearch pe depend karo, searchTerm pe nahi

  return (
    <div>
      <input
        type="text"
        placeholder="Search campaigns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        // Har keystroke pe API call NAHI hogi
        // Sirf 300ms ruk ke hogi
      />
      {loading && <p>Searching...</p>}
      {results.map(r => <div key={r.id}>{r.name}</div>)}
    </div>
  );
}
*/

/*
=== HOW DEBOUNCE WORKS ===

WITHOUT debounce (bad):
User types: "N" → API call
User types: "Ni" → API call  
User types: "Nik" → API call
User types: "Nike" → API call
= 4 unnecessary API calls!

WITH debounce (good):
User types: "N" → timer start (300ms)
User types: "Ni" → timer reset
User types: "Nik" → timer reset
User types: "Nike" → timer reset
300ms passes... → 1 API call with "Nike"
= Only 1 API call! ✅
*/