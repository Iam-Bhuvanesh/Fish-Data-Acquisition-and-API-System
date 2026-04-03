import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Droplets, Thermometer, FlaskConical, Wind, ArrowRight, AlertOctagon, CheckCircle, Info, MonitorPlay } from 'lucide-react';
import api from '../api/api';
import './DigitalTwin.css';

// Initial Mock Data for the chart (Historical + Projection)
const initializeData = (currentVal = 6.5) => {
  const data = [];
  const now = new Date();
  for (let i = -12; i <= 6; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    // Use currentVal as the pivot for the prediction
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: time,
      actualDo: i <= 0 ? currentVal + Math.sin(i / 2) * 1.5 : null,
      predictedDo: i >= 0 ? currentVal + Math.sin(i / 2) * 1.5 - (i * 0.2) : null,
      isFuture: i > 0
    });
  }
  return data;
};

const DigitalTwin = () => {
    const [data, setData] = useState(initializeData());
    const [aerationRate, setAerationRate] = useState(50);
    const [feedingAmount, setFeedingAmount] = useState(50);
    const [waterExchange, setWaterExchange] = useState(0);

    const [pondState, setPondState] = useState({
        temperature: { current: 28.5, optimal: 28, unit: '°C', icon: Thermometer, color: '#f59e0b' },
        ph: { current: 7.2, optimal: 7.5, unit: '', icon: FlaskConical, color: '#10b981' },
        dissolvedOxygen: { current: 6.5, optimal: 6.0, unit: 'mg/L', icon: Wind, color: '#3b82f6' },
        ammonia: { current: 0.25, optimal: 0.1, unit: 'mg/L', icon: Droplets, color: '#ef4444' }
    });

    const [insights, setInsights] = useState([]);

    // 1. Fetch Real-Time metrics every 10 seconds
    const fetchSyncData = async () => {
        try {
            const { data: latest } = await api.get('/water-quality/latest');
            if (latest) {
                setPondState(prev => ({
                    ...prev,
                    temperature: { ...prev.temperature, current: latest.temperature },
                    ph: { ...prev.ph, current: latest.ph },
                    dissolvedOxygen: { ...prev.dissolvedOxygen, current: latest.dissolvedOxygen },
                    ammonia: { ...prev.ammonia, current: latest.ammonia || 0.1 }
                }));
            }
        } catch (error) {
            console.error('Digital Twin Sync Error:', error);
        }
    };

    useEffect(() => {
        fetchSyncData();
        const syncInterval = setInterval(fetchSyncData, 10000);
        return () => clearInterval(syncInterval);
    }, []);

    // 2. Predictive Engine Logic
    useEffect(() => {
    // Simulate complex system logic and prediction updates
    const simulatePrediction = () => {
      const currentData = [...initializeData()];
      
      // Affect prediction based on scenario inputs
      const newData = currentData.map((point, i) => {
        if (!point.isFuture && point.actualDo !== null) return point;
        
        let newPredictedDo = point.predictedDo;
        let newPredictedAmmonia = point.predictedAmmonia;
        
        // Scenario Effects (Simple physical system mock)
        // Aeration boosts DO, Feeding decreases DO and increases Ammonia, Water exchange reduces Ammonia
        const aerationEffect = (aerationRate - 50) * 0.02;
        const feedingEffectDO = (feedingAmount - 50) * -0.015;
        const feedingEffectNH3 = (feedingAmount - 50) * 0.005;
        const exchangeEffectNH3 = waterExchange * -0.01;

        // Apply accumulation over time based on future index
        const futureIndex = i - 12; // Since current is at index 12
        if (futureIndex > 0) {
           newPredictedDo = newPredictedDo + (aerationEffect + feedingEffectDO) * futureIndex;
           newPredictedAmmonia = newPredictedAmmonia + (feedingEffectNH3 + exchangeEffectNH3) * futureIndex;
        }

        // Clamp values
        return {
          ...point,
          predictedDo: Math.max(0, Math.min(12, newPredictedDo)),
          predictedAmmonia: Math.max(0, newPredictedAmmonia)
        };
      });

      setData(newData);

      // Generate localized insights based on the 6hr forecast
      const futureHours = newData.filter(d => d.isFuture);
      const minDO = Math.min(...futureHours.map(d => d.predictedDo));
      const maxNH3 = Math.max(...futureHours.map(d => d.predictedAmmonia));

      const newInsights = [];
      if (minDO < 4.0) {
        newInsights.push({ type: 'danger', msg: `Critical Warning: Dissolved Oxygen projected to drop to ${minDO.toFixed(1)} mg/L within 6 hours. Increase Aeration.` });
      } else if (minDO < 5.5) {
        newInsights.push({ type: 'warning', msg: `Notice: Dissolved Oxygen showing a declining trend.` });
      } else {
        newInsights.push({ type: 'safe', msg: `Optimal: Oxygen levels are projected to remain stable.` });
      }

      setInsights(newInsights);
    };

    simulatePrediction();
  }, [aerationRate, feedingAmount, waterExchange, pondState.dissolvedOxygen.current]);

  useEffect(() => {
    // Re-initialize chart baseline when pond state changes
    setData(initializeData(pondState.dissolvedOxygen.current));
  }, [pondState.dissolvedOxygen.current]);


  const StatCard = ({ title, data }) => {
    const Icon = data.icon;
    const isWarning = Math.abs(data.current - data.optimal) / data.optimal > 0.3; // 30% deviation
    return (
      <div className={`dt-stat-card ${isWarning ? 'dt-stat-warning' : ''}`}>
        <div className="dt-stat-header">
          <div className="dt-stat-icon" style={{ backgroundColor: `${data.color}20`, color: data.color }}>
            <Icon size={20} />
          </div>
          <span className="dt-stat-title">{title}</span>
        </div>
        <div className="dt-stat-body">
          <div className="dt-stat-current">
            {data.current}
            <span className="dt-stat-unit">{data.unit}</span>
          </div>
          <div className="dt-stat-optimal">
            Target: {data.optimal} {data.unit}
          </div>
        </div>
        <div className="dt-stat-progress">
          <div 
            className="dt-stat-progress-bar" 
            style={{ 
              width: `${Math.min(100, (data.current / (data.optimal * 1.5)) * 100)}%`,
              backgroundColor: data.color 
            }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dt-container">
      <header className="dt-header">
        <div>
          <h1 className="dt-title">
            <Activity className="dt-title-icon" /> 
            Digital Twin Engine
          </h1>
          <p className="dt-subtitle">Virtual pond simulation, predictive forecasting & AI decision support.</p>
        </div>
        <div className="dt-status-badge">
          <span className="dt-status-dot"></span>
          Simulation Active
        </div>
      </header>

      {/* Dynamic State Overview */}
      <section className="dt-state-grid">
        <StatCard title="Water Temperature" data={pondState.temperature} />
        <StatCard title="pH Level" data={pondState.ph} />
        <StatCard title="Dissolved Oxygen" data={pondState.dissolvedOxygen} />
        <StatCard title="Ammonia (NH3)" data={pondState.ammonia} />
      </section>

      <div className="dt-main-layout">
        {/* Predictive Analysis Chart */}
        <section className="dt-chart-section dt-panel glass-panel">
          <div className="dt-panel-header">
            <h2>Predictive Forecasting (6-Hour Window)</h2>
            <div className="dt-legend">
              <span className="dt-legend-item"><div className="dt-dot historical"></div> Historical DO</span>
              <span className="dt-legend-item"><div className="dt-dot predicted"></div> Predicted DO</span>
            </div>
          </div>
          <div className="dt-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
                <ReferenceLine x={data[12]?.time} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'CURRENT STATE', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="actualDo" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual DO" />
                <Area type="monotone" dataKey="predictedDo" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredict)" name="Predicted DO" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="dt-side-layout">
          {/* Scenario Simulator */}
          <section className="dt-simulator-section dt-panel glass-panel">
            <h2>Scenario Simulator</h2>
            <p className="dt-panel-desc">Adjust variables to simulate outcomes</p>
            
            <div className="dt-slider-group">
              <div className="dt-slider-label">
                <span>Aeration Intensity ({aerationRate}%)</span>
                <Wind size={16} className="dt-slider-icon" />
              </div>
              <input 
                type="range" 
                className="dt-slider" 
                min="0" max="100" 
                value={aerationRate} 
                onChange={(e) => setAerationRate(parseInt(e.target.value))}
              />
            </div>

            <div className="dt-slider-group">
              <div className="dt-slider-label">
                <span>Feeding Rate ({feedingAmount}%)</span>
                <FlaskConical size={16} className="dt-slider-icon warning-icon" />
              </div>
              <input 
                type="range" 
                className="dt-slider warning-slider" 
                min="0" max="100" 
                value={feedingAmount} 
                onChange={(e) => setFeedingAmount(parseInt(e.target.value))}
              />
            </div>

            <div className="dt-slider-group">
              <div className="dt-slider-label">
                <span>Water Exchange ({waterExchange}%)</span>
                <Droplets size={16} className="dt-slider-icon action-icon" />
              </div>
              <input 
                type="range" 
                className="dt-slider action-slider" 
                min="0" max="100" 
                value={waterExchange} 
                onChange={(e) => setWaterExchange(parseInt(e.target.value))}
              />
            </div>
            
            <button className="dt-reset-btn" onClick={() => { setAerationRate(50); setFeedingAmount(50); setWaterExchange(0); }}>
              Reset Default Horizon
            </button>
          </section>

          {/* AI Decision Support */}
          <section className="dt-insights-section dt-panel glass-panel">
            <h2>Decision Intelligence</h2>
            <div className="dt-insights-list">
              {insights.map((insight, idx) => (
                <div key={idx} className={`dt-insight-card dt-insight-${insight.type}`}>
                  <div className="dt-insight-icon">
                    {insight.type === 'danger' && <AlertOctagon size={18} />}
                    {insight.type === 'warning' && <AlertOctagon size={18} />}
                    {insight.type === 'safe' && <CheckCircle size={18} />}
                  </div>
                  <p>{insight.msg}</p>
                </div>
              ))}
              <div className="dt-insight-card dt-insight-info">
                <div className="dt-insight-icon"><Info size={18} /></div>
                <p>Digital Twin currently mapped to Virtual Sensor Node-X9. <ArrowRight size={14} style={{display:'inline', verticalAlign:'middle'}}/></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
