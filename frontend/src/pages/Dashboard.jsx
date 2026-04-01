import { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Thermometer, Sprout, Power, CloudRain, AlertTriangle, Minus, Plus, X, Trash2, Edit } from 'lucide-react';
import '../pages_design/Dashboard.css';

function Dashboard() {
  const [plantData, setPlantData] = useState([]);
  const [alertPlant, setAlertPlant] = useState(null);
  const [countdown, setCountdown] = useState(30);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', userId: '' });
  const [selectedPlant, setSelectedPlant] = useState(null);

  const API_URL = "http://172.20.10.4:5000/api/plants";
  
  // 1. Retreive user data and token
  const loggedInUser = JSON.parse(localStorage.getItem('user')) || { id: '', username: 'Guest' };
  const token = localStorage.getItem("token");

  // 2. Configure headers for all axios requests
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchData = async () => {
    try {
      // GET asks for config as second argument
      const res = await axios.get(API_URL, axiosConfig);
      setPlantData(res.data);
      
      const thirstyPlant = res.data.find(p => p.moisture < 30 && !p.isPumpOn);
      if (thirstyPlant && !alertPlant) {
        setAlertPlant(thirstyPlant);
        setCountdown(30);
      }
    } catch (err) {
      console.error("Error retrieving data.", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [alertPlant]);

  useEffect(() => {
    let timer;
    if (alertPlant && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (alertPlant && countdown === 0) {
      togglePump(alertPlant._id, false);
      setAlertPlant(null);
    }
    return () => clearTimeout(timer);
  }, [alertPlant, countdown]);

  const togglePump = async (id, currentState) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { isPumpOn: !currentState }, axiosConfig);
      setAlertPlant(null);
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.error || "PUMP Error.");
    }
  };

  const changeFlow = async (id, currentFlow, delta) => {
    try {
      const nextFlow = Math.max(1, Math.min(5, (currentFlow || 3) + delta));
      await axios.patch(`${API_URL}/${id}/flow`, { flowLevel: nextFlow }, axiosConfig);
      fetchData();
    } catch (err) {
      console.error("FLOW Error.", err);
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: '', userId: loggedInUser.id });
    setIsModalOpen(true);
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      // POST: (URL, DATE, CONFIG)
      await axios.post(`${API_URL}/add`, formData, axiosConfig);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      // Display the error sent by the server for troubleshooting
      alert(err.response?.data?.error || "Error at Add!");
    }
  };

  const handleOpenEdit = (planta) => {
    setSelectedPlant(planta);
    setFormData({ name: planta.name, userId: loggedInUser.id });
    setIsEditOpen(true);
  };

  const handleEditPlant = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_URL}/${selectedPlant._id}/details`, { 
        name: formData.name, 
        userId: loggedInUser.id 
      }, axiosConfig);
      setIsEditOpen(false);
      fetchData();
    } catch (err) {
      alert("Error at Edit!");
    }
  };

  const handleOpenDelete = (planta) => {
    setSelectedPlant(planta);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // DELETE requires config as second argument
      await axios.delete(`${API_URL}/${selectedPlant._id}`, axiosConfig);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      alert("Error at Delete!");
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* --- Adding Modal--- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            <div style={{ marginBottom: '15px' }}>
              <Sprout size={50} color="#10b981" />
            </div>
            <h2>Add a new plant 🌱</h2>
            <form onSubmit={handleAddPlant}>
              <div className="form-group">
                <label>Plant Name:</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Basil, Mint..." 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Owner:</label>
                <div className="static-field">{loggedInUser.username} (You)</div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Plant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsEditOpen(false)}><X size={24} /></button>
            <div style={{ marginBottom: '15px' }}>
              <Edit size={50} color="#3b82f6" />
            </div>
            <h2>Edit Plant Details ✏️</h2>
            <form onSubmit={handleEditPlant}>
              <div className="form-group">
                <label>New Plant Name:</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Owner:</label>
                <div className="static-field">{loggedInUser.username} (You)</div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Popup --- */}
      {isDeleteOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsDeleteOpen(false)}><X size={24} /></button>
            <div style={{ marginBottom: '15px' }}>
              <AlertTriangle size={50} color="#ef4444" />
            </div>
            <h2>Delete Plant? 🗑️</h2>
            <p className="modal-description">
              Are you sure you want to delete <strong>{selectedPlant?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsDeleteOpen(false)}>No, cancel.</button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>Yes, delete.</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 30S Alert --- */}
      {alertPlant && (
  <div className="modal-overlay">
    <div className="modal-card alert-card-style">
      <button className="modal-close" onClick={() => setAlertPlant(null)}>
        <X size={24} />
      </button>

      <div className="alert-icon-container">
        <AlertTriangle size={60} color="#ef4444" />
      </div>

      <h2>{alertPlant.name} needs water! ⚠️</h2>
      
      <div className="alert-info-box">
        <p>The humidity level has dropped below the optimum threshold.</p>
        <div className="timer-display">
          Auto-irigation in: <span>{countdown}s</span> ⏳
        </div>
      </div>

      <div className="modal-actions">
        <button 
          className="btn-save water-now-btn" 
          onClick={() => togglePump(alertPlant._id, false)}
        >
          Water now 💧
        </button>
      </div>
    </div>
  </div>
)}

      <header className="dashboard-header">
        <h1>My Garden 🌱</h1>
      </header>

      <div className="grid">
        {plantData.map((planta) => (
          <div key={planta._id} className={`plant-card ${planta.moisture < 30 ? 'critical' : ''}`}>
            <div className="plant-actions">
              <button className="action-btn" onClick={() => handleOpenEdit(planta)}><Edit size={16} /></button>
              <button className="action-btn delete" onClick={() => handleOpenDelete(planta)}><Trash2 size={16} /></button>
            </div>

            <div className="card-header">
              <Sprout size={32} color="#10b981" />
              <h2>{planta.name}</h2>
            </div>

            <div className="stats">
              <div className="stat-row"><Droplets color="#3b82f6" /> <span>Soil: <strong>{planta.moisture}%</strong></span></div>
              <div className="stat-row"><CloudRain color="#60a5fa" /> <span>Air: <strong>{Number(planta.humidity).toFixed(2)}%</strong></span></div>
              <div className="stat-row"><Thermometer color="#ef4444" /> <span>Temp: <strong>{Number(planta.temperature).toFixed(2)}°C</strong></span></div>
            </div>

            <div className="flow-control-section">
              <span className="flow-label">Flow: Level {planta.flowLevel || 3}</span>
              <div className="flow-buttons">
                  <button onClick={() => changeFlow(planta._id, planta.flowLevel, -1)} disabled={(planta.flowLevel || 1) <= 1}>
                    <Minus size={18} />
                  </button>
                  <div className="flow-bar">
                      {[1, 2, 3, 4, 5].map((step) => (
                          <div key={step} className={`bar-step ${step <= (planta.flowLevel || 3) ? 'active' : ''}`}></div>
                      ))}
                  </div>
                  <button onClick={() => changeFlow(planta._id, planta.flowLevel, 1)} disabled={(planta.flowLevel || 5) >= 5}>
                    <Plus size={18} />
                  </button>
              </div>
            </div>

            <button 
              className={`pump-btn ${planta.isPumpOn ? 'on' : 'off'} ${planta.moisture >= 65 ? 'locked' : ''}`}
              onClick={() => togglePump(planta._id, planta.isPumpOn)}
              disabled={planta.moisture >= 65 && !planta.isPumpOn}
            >
              <Power size={18} />
              {planta.moisture >= 65 && !planta.isPumpOn ? "Saturated (65%+)" : (planta.isPumpOn ? "Stop" : "Start")}
            </button>
          </div>
        ))}

        <div className="plant-card add-card" onClick={handleOpenModal}>
            <Plus size={48} />
            <span>Add a New Plant</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;