'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Package,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ChevronRight,
  Loader2,
  Users
} from 'lucide-react';

export default function ProductLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [search, setSearch] = useState('');

  const productsList = [
    'All Products',
    'Innonsh Website',
    'Innonsh SprintOS',
    'Innonsh ClinicPro',
    'Innonsh WorkGrid',
    'Innonsh TinySteps',
    'Salon Management ERP',
    'Innonsh LeadGen'
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // We fetch all leads, or if we want we can add a filter to /api/leads 
      // but for dynamic fast filtering, we'll fetch all and filter in client if no specific endpoint
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Fetch leads failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    // Only show leads that came from the website (System API) and exclude manual entries by Amit/Sales Reps
    const isWebsiteLead = lead.source === 'Website' && !lead.notes?.some(n => n.text?.startsWith('Lead created by '));
    const matchesProduct = selectedProduct === 'All Products' || (lead.interestedProduct && lead.interestedProduct.toLowerCase().includes(selectedProduct.toLowerCase().replace('innonsh ', '')));
    const matchesSearch = lead.company?.toLowerCase().includes(search.toLowerCase()) || 
                          lead.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.email?.toLowerCase().includes(search.toLowerCase());
    return isWebsiteLead && matchesProduct && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Contacted': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Qualified': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Lost': return 'bg-rose-50 text-rose-700 border border-rose-100';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 h-full relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="h-7 w-7 text-emerald-500" />
            Product Leads
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Track and manage incoming leads grouped by specific products and websites.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        
        {/* Product Dropdown */}
        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Select Product</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none outline-none transition-all cursor-pointer bg-slate-50 hover:bg-slate-100"
            >
              {productsList.map(prod => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:flex-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Search Leads</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by company, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Product Leads</p>
            <h3 className="text-2xl font-black text-slate-800">{filteredLeads.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">New Inquiries</p>
            <h3 className="text-2xl font-black text-slate-800">{filteredLeads.filter(l => l.status === 'New').length}</h3>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
            <span className="text-sm font-bold">Loading product leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No leads found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              We couldn't find any leads matching the selected product or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
                  <th className="px-5 py-3.5">Company / Lead</th>
                  <th className="px-5 py-3.5">Product Interest</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 transition duration-150 group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {lead.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{lead.company}</p>
                          <p className="text-xs text-slate-500 font-medium">{lead.firstName} {lead.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <Package className="h-3 w-3" />
                        {lead.interestedProduct || 'General Inquiry'}
                      </span>
                    </td>
                    <td className="px-5 py-4 space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a href={`/dashboard/leads`} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition">
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
