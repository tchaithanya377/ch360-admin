import React from 'react';
import { useForm } from 'react-hook-form';

const ScheduleEditor = ({ defaultValue, onSubmit, isSubmitting, templates }) => {
  const { register, handleSubmit } = useForm({ defaultValues: defaultValue || {
    name: '', description: '', schedule_type: 'ASSIGNMENT', frequency: 'WEEKLY', interval: 1,
    start_date: '', end_date: '', is_active: true, template: ''
  }});
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input {...register('name')} placeholder="Schedule name" className="px-3 py-2 border rounded w-full" />
      <textarea {...register('description')} placeholder="Description" className="px-3 py-2 border rounded w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select {...register('frequency')} className="px-3 py-2 border rounded">
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
        <input type="number" {...register('interval', { valueAsNumber: true })} className="px-3 py-2 border rounded" placeholder="Interval" />
        <select {...register('template')} className="px-3 py-2 border rounded">
          <option value="">Select template</option>
          {(templates||[]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="datetime-local" {...register('start_date')} className="px-3 py-2 border rounded" />
        <input type="datetime-local" {...register('end_date')} className="px-3 py-2 border rounded" />
      </div>
      <label className="inline-flex items-center space-x-2"><input type="checkbox" {...register('is_active')} /><span>Active</span></label>
      <div className="flex justify-end"><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Save Schedule</button></div>
    </form>
  );
};

export default ScheduleEditor;


