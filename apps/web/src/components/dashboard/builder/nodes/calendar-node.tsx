'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Calendar } from 'lucide-react';

function CalendarNode({ data, selected }: NodeProps) {
  const [action, setAction] = useState(data.action || 'create');
  const [calendar, setCalendar] = useState(data.calendar || 'primary');
  const [title, setTitle] = useState(data.title || '');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-600"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 text-white">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Calendar</div>
          <div className="text-xs text-muted-foreground">Manage events</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Action</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="create">Create Event</option>
            <option value="update">Update Event</option>
            <option value="delete">Delete Event</option>
            <option value="list">List Events</option>
            <option value="find">Find Free Time</option>
          </select>
        </div>
        {action === 'create' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Event Title</label>
              <input 
                className="w-full px-2 py-1 text-xs border rounded bg-background"
                placeholder="Meeting with team"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Calendar</label>
              <select 
                className="w-full px-2 py-1 text-xs border rounded bg-background"
                value={calendar}
                onChange={(e) => setCalendar(e.target.value)}
              >
                <option value="primary">Primary</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-600"
      />
    </div>
  );
}

export default memo(CalendarNode);
