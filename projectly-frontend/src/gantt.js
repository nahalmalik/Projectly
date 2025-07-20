// src/components/Gantt.js
import React, { useEffect } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

const Gantt = ({ tasks }) => {
  useEffect(() => {
    // Initialize Gantt chart
    gantt.init("gantt-container");
    
    // Configure Gantt settings
    gantt.config.scale_unit = "day";
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
      { unit: "hour", step: 6, date: "%H:%i" }
    ];
    gantt.config.min_column_width = 30;
    gantt.config.duration_unit = "day";
    gantt.config.work_time = true;
    gantt.config.columns = [
      { name: "text", label: "Task name", tree: true, width: 160 },
      { name: "start_date", label: "Start time", align: "center" },
      { name: "duration", label: "Duration", align: "center" },
      { name: "progress", label: "Progress", align: "center", template: (obj) => {
        return Math.round(obj.progress * 100) + "%";
      }}
    ];
    
    gantt.config.autofit = true;
    gantt.config.fit_tasks = true;
    
    // Parse the tasks data
    gantt.parse({ data: tasks });
    
    return () => {
      // Clean up when component unmounts
      gantt.clearAll();
    };
  }, [tasks]);

  return (
    <div 
      id="gantt-container" 
      style={{ 
        width: '100%', 
        height: '500px',
        margin: '20px 0'
      }}
    ></div>
  );
};

export default Gantt;