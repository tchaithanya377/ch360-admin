import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import assignmentsApiService from '../services/assignmentsApiService';
import { adaptPagination } from '../utils/paginationAdapter';

// Query Keys
export const qk = {
  assignments: (params) => ['assignments.list', params],
  assignment: (id) => ['assignments.detail', id],
  submissions: (id, params) => ['assignments.submissions', id, params],
  rubrics: (params) => ['rubrics.list', params],
  categories: ['categories.list'],
  outcomes: (id) => ['outcomes', id],
  peerReviews: (id) => ['peerReviews', id],
  plagiarism: (id) => ['plagiarism', id],
  analytics: (id) => ['analytics', id],
  notifications: (params) => ['notifications', params],
  schedules: (params) => ['schedules', params],
};

export function useAssignmentsList(params) {
  return useQuery({
    queryKey: qk.assignments(params),
    queryFn: async () => {
      const res = await assignmentsApiService.getAssignments(params || {});
      return adaptPagination(res);
    },
    keepPreviousData: true,
  });
}

export function useAssignmentDetail(id) {
  return useQuery({
    queryKey: qk.assignment(id),
    queryFn: () => assignmentsApiService.getAssignment(id),
    enabled: !!id,
  });
}

export function useAssignmentSubmissions(id, params) {
  return useQuery({
    queryKey: qk.submissions(id, params),
    queryFn: () => assignmentsApiService.getAssignmentSubmissions(id, params),
    enabled: !!id,
  });
}

export function useRubrics(params) {
  return useQuery({
    queryKey: qk.rubrics(params),
    queryFn: () => assignmentsApiService.getRubrics(params || {}),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: () => assignmentsApiService.getCategories(),
  });
}

export function useOutcomes(assignmentId) {
  return useQuery({
    queryKey: qk.outcomes(assignmentId),
    queryFn: () => assignmentsApiService.getLearningOutcomes(assignmentId),
    enabled: !!assignmentId,
  });
}

export function usePeerReviews(assignmentId) {
  return useQuery({
    queryKey: qk.peerReviews(assignmentId),
    queryFn: () => assignmentsApiService.getPeerReviews(assignmentId),
    enabled: !!assignmentId,
  });
}

export function usePlagiarism(assignmentId) {
  return useQuery({
    queryKey: qk.plagiarism(assignmentId),
    queryFn: () => assignmentsApiService.getPlagiarismChecks(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useAnalytics(assignmentId) {
  return useQuery({
    queryKey: qk.analytics(assignmentId),
    queryFn: () => assignmentsApiService.getAssignmentAnalytics(assignmentId),
    enabled: !!assignmentId,
    staleTime: 30000,
  });
}

export function useNotifications(params) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.notifications(params),
    queryFn: () => assignmentsApiService.getNotifications(params || {}),
  });
  const markRead = useMutation({
    mutationFn: ({ id }) => assignmentsApiService.patchNotification(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(params) }),
  });
  return { ...query, markRead };
}

export function useSchedules(params) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.schedules(params),
    queryFn: () => assignmentsApiService.getSchedules(params || {}),
  });
  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => assignmentsApiService.patchSchedule(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedules(params) }),
  });
  return { ...query, toggleActive };
}


