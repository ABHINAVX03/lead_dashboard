import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axios';
import { Lead, LeadFilters, LeadsResponse, PaginationData } from '../types';
import { LeadTable } from '../components/LeadTable';
import { LeadModal } from '../components/LeadModal';
import { Filters } from '../components/Filters';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pages: 0, limit: 10 });
  const [filters, setFilters] = useState<LeadFilters>({ status: '', source: '', search: '', sort: 'latest' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', String(pagination.page));
      params.append('limit', String(pagination.limit));

      const { data } = await api.get<LeadsResponse>(`/leads?${params}`);
      setLeads(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (debouncedSearch) params.append('search', debouncedSearch);
      const response = await api.get(`/leads/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Management</h2>
          <div className="flex gap-3">
            <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Export CSV</button>
            <button onClick={() => { setEditingLead(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">+ Add Lead</button>
          </div>
        </div>
        <Filters filters={filters} setFilters={setFilters} />
        <LeadTable leads={leads} loading={loading} onEdit={(lead) => { setEditingLead(lead); setIsModalOpen(true); }} onDelete={handleDelete} currentUserRole={user?.role || 'sales'} currentUserId={user?.id || user?._id || ''} />
        {!loading && leads.length === 0 && (<div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">No leads found</p></div>)}
        {pagination.pages > 1 && (<Pagination pagination={pagination} onPageChange={handlePageChange} />)}
        <LeadModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLead(null); }} onSuccess={fetchLeads} editingLead={editingLead} />
      </div>
    </div>
  );
};
