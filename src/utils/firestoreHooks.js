import { useEffect, useState } from "react";

// Minimal no-op implementations to allow builds to succeed without Firestore
// Replace with real Firestore-backed logic when backend is ready.

export function useCollection(_collectionName, _options) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
    setData([]);
    setError(null);
  }, [_collectionName]);

  return { data, loading, error };
}

export function useSingletonDoc(_docPath) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
    setData(null);
    setError(null);
  }, [_docPath]);

  return { data, loading, error };
}

export async function addItem(_collectionName, _payload) {
  // TODO: integrate with backend
  return { id: "stub-id", ..._payload };
}

export async function setItem(_collectionName, _id, _payload) {
  // TODO: integrate with backend
  return { id: _id || "stub-id", ..._payload };
}

export async function updateItem(_collectionName, _id, _payload) {
  // TODO: integrate with backend
  return { id: _id, ..._payload };
}

export async function runBatch(_operations) {
  // TODO: integrate with backend
  return true;
}


