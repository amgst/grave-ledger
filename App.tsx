
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GraveTable from './components/GraveTable';
import GraveForm from './components/GraveForm';
import AIAssistant from './components/AIAssistant';
import { GraveRecord, Gender } from './types';

const INITIAL_DATA: GraveRecord[] = [
  {
    id: '1',
    deceasedFullName: 'الینور وینس',
    parentNames: 'ساموئیل اور مارتھا وینس',
    husbandName: 'رابرٹ وینس',
    relativeContact: '+92 300 1234567',
    dateOfBirth: '1945-05-12',
    dateOfDeath: '2023-11-04',
    ageAtDeath: 78,
    gender: Gender.FEMALE,
    graveNumber: '101',
    notes: 'علاقے کی مشہور استانی اور مخلص خاتون۔',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    deceasedFullName: 'ارتھر پنہالیگن',
    parentNames: 'ایڈورڈ پنہالیگن',
    relativeContact: '+92 300 7654321',
    dateOfBirth: '1960-01-22',
    dateOfDeath: '2024-02-15',
    ageAtDeath: 64,
    gender: Gender.MALE,
    graveNumber: '102',
    notes: 'ایک مخلص سماجی کارکن۔',
    createdAt: new Date().toISOString()
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<GraveRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<GraveRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('small_grave_records_v3_urdu');
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      setRecords(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('small_grave_records_v3_urdu', JSON.stringify(records));
    }
  }, [records]);

  const getNextGraveNumber = () => {
    if (records.length === 0) return "1";
    // Find all numeric grave numbers, increment the max one
    const numbers = records
      .map(r => parseInt(r.graveNumber.replace(/\D/g, '')))
      .filter(n => !isNaN(n));
    
    if (numbers.length === 0) return (records.length + 1).toString();
    return (Math.max(...numbers) + 1).toString();
  };

  const handleSaveRecord = (formData: Omit<GraveRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...formData, id: r.id, createdAt: r.createdAt } : r));
    } else {
      const newRecord: GraveRecord = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setEditingRecord(null);
    setActiveTab('records');
  };

  const handleEdit = (record: GraveRecord) => {
    setEditingRecord(record);
    setActiveTab('add');
  };

  const renderContent = () => {
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
