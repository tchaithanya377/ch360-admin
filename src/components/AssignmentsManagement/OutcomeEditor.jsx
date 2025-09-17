import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

const OutcomeEditor = ({ defaultValue, onSubmit, isSubmitting }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: { outcomes: defaultValue || [{ outcome: '', bloom_taxonomy_level: 'APPLY', weight: 0.2, achievement_threshold: 0.6 }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'outcomes' });
  const sumWeight = (watch('outcomes') || []).reduce((s, o) => s + (Number(o.weight) || 0), 0);

  return (
    <form onSubmit={handleSubmit((v)=> onSubmit(v.outcomes))} className="space-y-4">
      <div className="text-sm">Total weight: {sumWeight.toFixed(2)} {sumWeight > 1 && <span className="text-orange-600">(should be ≤ 1.00)</span>}</div>
      {fields.map((field, idx) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
          <input {...register(`outcomes.${idx}.outcome`)} placeholder="Outcome" className="px-3 py-2 border rounded md:col-span-2" />
          <select {...register(`outcomes.${idx}.bloom_taxonomy_level`)} className="px-3 py-2 border rounded">
            <option value="REMEMBER">Remember</option>
            <option value="UNDERSTAND">Understand</option>
            <option value="APPLY">Apply</option>
            <option value="ANALYZE">Analyze</option>
            <option value="EVALUATE">Evaluate</option>
            <option value="CREATE">Create</option>
          </select>
          <input type="number" step="0.01" {...register(`outcomes.${idx}.weight`, { valueAsNumber: true })} placeholder="Weight (0-1)" className="px-3 py-2 border rounded" />
          <input type="number" step="0.01" {...register(`outcomes.${idx}.achievement_threshold`, { valueAsNumber: true })} placeholder="Threshold (0-1)" className="px-3 py-2 border rounded" />
          <button type="button" onClick={() => remove(idx)} className="text-red-600 text-sm">Remove</button>
        </div>
      ))}
      <div className="flex justify-between">
        <button type="button" onClick={() => append({ outcome: '', bloom_taxonomy_level: 'APPLY', weight: 0, achievement_threshold: 0.6 })} className="px-3 py-2 bg-blue-500 text-white rounded">Add Outcome</button>
        <button type="submit" disabled={isSubmitting || sumWeight > 1.01} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Save Outcomes</button>
      </div>
    </form>
  );
};

export default OutcomeEditor;


