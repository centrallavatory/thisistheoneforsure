import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputForm from '../components/investigation/InputForm';
import { useToast } from '../context/ToastContext';

const NewInvestigation = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (data: any) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitted data:', data);
      showToast('Investigation started successfully', 'success');
      setLoading(false);
      navigate('/investigations');
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Investigation</h1>
      <p className="text-gray-400">
        Start a new investigation by providing any available information about the target. 
        Add as much or as little data as you have - the system will work with minimal input.
      </p>
      
      <InputForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default NewInvestigation;