import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  assignment_type: z.string().min(1),
  difficulty_level: z.string().min(1),
  category: z.string().uuid().optional(),
  is_apaar_compliant: z.boolean().default(false),
  due_date: z.string().min(1, 'Due date is required'),
  submission_reminder_days: z.number().int().min(0).max(30).optional(),
  late_submission_allowed: z.boolean().default(false),
  late_penalty_percentage: z.number().min(0).max(100).optional(),
  max_marks: z.number().min(1),
  rubric: z.string().uuid().optional(),
  enable_peer_review: z.boolean().default(false),
  peer_review_weight: z.number().min(0).max(100).optional(),
  requires_plagiarism_check: z.boolean().default(false),
  plagiarism_threshold: z.number().min(0).max(100).optional(),
  learning_objectives: z.string().optional(),
  estimated_time_hours: z.number().min(0).max(200).optional(),
});

const Step = ({ children }) => <div className="space-y-4">{children}</div>;

const AssignmentFormWizard = ({ onSubmit, defaults }) => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults || {
      title: '', description: '', instructions: '', assignment_type: 'RESEARCH_PAPER', difficulty_level: 'INTERMEDIATE',
      is_apaar_compliant: true, due_date: '', max_marks: 100
    }
  });

  const { handleSubmit, register, watch } = methods;
  const enablePeer = watch('enable_peer_review');
  const allowLate = watch('late_submission_allowed');
  const requiresPlag = watch('requires_plagiarism_check');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1 Basics */}
        <Step>
          <h3 className="font-semibold">Basics</h3>
          <input {...register('title')} placeholder="Title" className="px-3 py-2 border rounded w-full" />
          <textarea {...register('description')} placeholder="Description" className="px-3 py-2 border rounded w-full" />
          <textarea {...register('instructions')} placeholder="Instructions" className="px-3 py-2 border rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select {...register('assignment_type')} className="px-3 py-2 border rounded">
              <option value="RESEARCH_PAPER">Research Paper</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="PROJECT">Project</option>
            </select>
            <select {...register('difficulty_level')} className="px-3 py-2 border rounded">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <label className="inline-flex items-center space-x-2"><input type="checkbox" {...register('is_apaar_compliant')} /><span>APAAR compliant</span></label>
          </div>
        </Step>

        {/* Step 2 Schedule */}
        <Step>
          <h3 className="font-semibold">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="datetime-local" {...register('due_date')} className="px-3 py-2 border rounded" />
            <input type="number" {...register('submission_reminder_days', { valueAsNumber: true })} placeholder="Reminder days" className="px-3 py-2 border rounded" />
            <label className="inline-flex items-center space-x-2"><input type="checkbox" {...register('late_submission_allowed')} /><span>Allow late</span></label>
          </div>
          {allowLate && (
            <input type="number" {...register('late_penalty_percentage', { valueAsNumber: true })} placeholder="Late penalty %" className="px-3 py-2 border rounded" />
          )}
        </Step>

        {/* Step 3 Assessment */}
        <Step>
          <h3 className="font-semibold">Assessment</h3>
          <input type="number" {...register('max_marks', { valueAsNumber: true })} placeholder="Max marks" className="px-3 py-2 border rounded" />
          <label className="inline-flex items-center space-x-2"><input type="checkbox" {...register('enable_peer_review')} /><span>Enable peer review</span></label>
          {enablePeer && (
            <input type="number" {...register('peer_review_weight', { valueAsNumber: true })} placeholder="Peer review weight %" className="px-3 py-2 border rounded" />
          )}
        </Step>

        {/* Step 4 Integrity */}
        <Step>
          <h3 className="font-semibold">Integrity</h3>
          <label className="inline-flex items-center space-x-2"><input type="checkbox" {...register('requires_plagiarism_check')} /><span>Require plagiarism check</span></label>
          {requiresPlag && (
            <input type="number" {...register('plagiarism_threshold', { valueAsNumber: true })} placeholder="Similarity threshold %" className="px-3 py-2 border rounded" />
          )}
        </Step>

        {/* Step 5 Learning */}
        <Step>
          <h3 className="font-semibold">Learning</h3>
          <textarea {...register('learning_objectives')} placeholder="Learning objectives" className="px-3 py-2 border rounded w-full" />
          <input type="number" {...register('estimated_time_hours', { valueAsNumber: true })} placeholder="Estimated hours" className="px-3 py-2 border rounded" />
        </Step>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Assignment</button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AssignmentFormWizard;


