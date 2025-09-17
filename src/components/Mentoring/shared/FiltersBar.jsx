import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function FiltersBar({ showActive = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const academic_year = searchParams.get('academic_year') || '';
  const grade_level = searchParams.get('grade_level') || '';
  const section = searchParams.get('section') || '';
  const is_active = searchParams.get('is_active') ?? '';

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <input
        className="border rounded px-3 py-2"
        placeholder="Academic Year"
        value={academic_year}
        onChange={(e) => update('academic_year', e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Grade Level"
        value={grade_level}
        onChange={(e) => update('grade_level', e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Section"
        value={section}
        onChange={(e) => update('section', e.target.value)}
      />
      {showActive && (
        <select
          className="border rounded px-3 py-2"
          value={is_active}
          onChange={(e) => update('is_active', e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      )}
      <button
        className="border rounded px-3 py-2 bg-gray-100 hover:bg-gray-200"
        onClick={() => {
          const next = new URLSearchParams(searchParams.toString());
          next.delete('cursor');
          setSearchParams(next);
        }}
      >
        Apply
      </button>
    </div>
  );
}


