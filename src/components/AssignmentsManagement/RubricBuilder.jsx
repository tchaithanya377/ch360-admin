import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

const RubricBuilder = ({ defaultValue, onSubmit, isSubmitting }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: defaultValue || {
      name: '', rubric_type: 'ANALYTIC', total_points: 100, is_public: true,
      criteria: [{ name: '', description: '', points: 10, weight: 0.1 }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'criteria' });
  const criteria = watch('criteria');
  const totalWeight = (criteria || []).reduce((s, c) => s + (Number(c.weight) || 0), 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('name')} placeholder="Rubric name" className="px-3 py-2 border rounded" />
        <select {...register('rubric_type')} className="px-3 py-2 border rounded">
          <option value="ANALYTIC">Analytic</option>
          <option value="HOLISTIC">Holistic</option>
          <option value="CHECKLIST">Checklist</option>
        </select>
        <input type="number" {...register('total_points', { valueAsNumber: true })} className="px-3 py-2 border rounded" placeholder="Total points" />
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" {...register('is_public')} />
          <span>Public</span>
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between"><h4 className="font-semibold">Criteria</h4><button type="button" onClick={() => append({ name: '', description: '', points: 0, weight: 0 })} className="px-2 py-1 bg-blue-500 text-white rounded">Add</button></div>
        <div className="text-sm">Weight sum: {totalWeight.toFixed(2)} {totalWeight !== 1 && <span className="text-orange-600">(should be 1.00)</span>}</div>
        {fields.map((field, idx) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <input {...register(`criteria.${idx}.name`)} placeholder="Name" className="px-3 py-2 border rounded" />
            <input {...register(`criteria.${idx}.description`)} placeholder="Description" className="px-3 py-2 border rounded md:col-span-2" />
            <input type="number" step="1" {...register(`criteria.${idx}.points`, { valueAsNumber: true })} placeholder="Points" className="px-3 py-2 border rounded" />
            <input type="number" step="0.01" {...register(`criteria.${idx}.weight`, { valueAsNumber: true })} placeholder="Weight (0-1)" className="px-3 py-2 border rounded" />
            <button type="button" onClick={() => remove(idx)} className="text-red-600 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting || totalWeight <= 0 || totalWeight > 1.01} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Save Rubric</button>
      </div>
    </form>
  );
};

export default RubricBuilder;


