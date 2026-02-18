
import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GraveTable from './components/GraveTable';
import GraveForm from './components/GraveForm';
import AIAssistant from './components/AIAssistant';
import { GraveRecord, Gender } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<GraveRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<GraveRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'graves'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GraveRecord[];
        setRecords(fetchedRecords);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching records: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberEmail) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
    } catch (error) {
      setAuthError('Login failed. Please check your email and password.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const getNextGraveNumber = () => {
    if (records.length === 0) return "1";
    // Find all numeric grave numbers, increment the max one
    const numbers = records
      .map(r => parseInt(r.graveNumber.replace(/\D/g, '')))
      .filter(n => !isNaN(n));

    if (numbers.length === 0) return (records.length + 1).toString();
    return (Math.max(...numbers) + 1).toString();
  };

  const handleSaveRecord = async (formData: Omit<GraveRecord, 'id' | 'createdAt'>) => {
    try {
      if (editingRecord) {
        const recordRef = doc(db, 'graves', editingRecord.id);
        await updateDoc(recordRef, {
          ...formData
        });
      } else {
        await addDoc(collection(db, 'graves'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setEditingRecord(null);
      setActiveTab('records');
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Error saving record. Please try again.");
    }
  };

  const handleEdit = (record: GraveRecord) => {
    setEditingRecord(record);
    setActiveTab('add');
  };

  const handleDelete = async (record: GraveRecord) => {
    const confirmed = window.confirm('Are you sure you want to delete this record? This cannot be undone.');
    if (!confirmed) return;

    try {
      const recordRef = doc(db, 'graves', record.id);
      await deleteDoc(recordRef);
    } catch (error) {
      console.error('Error deleting document: ', error);
      alert('Error deleting record. Please try again.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 text-center">Loading data...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard records={records} />;
      case 'records':
        return <GraveTable records={records} onEdit={handleEdit} />;
      case 'add':
        return (
          <GraveForm
            onSave={handleSaveRecord}
            onCancel={() => {
              setEditingRecord(null);
              setActiveTab('records');
            }}
            initialData={editingRecord || undefined}
            suggestedGraveNumber={getNextGraveNumber()}
            onDelete={editingRecord ? () => handleDelete(editingRecord) : undefined}
          />
        );
      case 'analysis':
        return <AIAssistant records={records} />;
      default:
        return <Dashboard records={records} />;
    }
  };

  if (!authInitialized) {
    return <div className="min-h-screen flex items-center justify-center">App is starting...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="ltr">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8 space-y-6">
          <h1 className="text-xl font-bold text-slate-800 text-left">Admin Login</h1>
          <p className="text-sm text-slate-500 text-left">Only authorized admins can access this record.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 text-left">Email</label>
              <input
                type="email"
                autoComplete="username"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 text-left">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                />
                <span>Remember this email on this device</span>
              </label>
            </div>
            {authError && (
              <div className="text-sm text-red-600 text-left">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
