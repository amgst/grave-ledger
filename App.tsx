
import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './services/firebase';
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

  useEffect(() => {
    const q = query(collection(db, 'graves'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GraveRecord[];
      setRecords(fetchedRecords);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching records: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          />
        );
      case 'analysis':
        return <AIAssistant records={records} />;
      default:
        return <Dashboard records={records} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
