import React, { useState } from 'react';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  AlertCircle,
  Tag,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Vendor, VendorQuotation } from '../../types/event';
import { formatCurrency } from '../../utils/budgetLogic';
import { apiUrl } from '../../utils/api';

export const VendorComparison: React.FC = () => {
  const { activeEvent, addVendor, updateVendor, deleteVendor, addVendorQuotation, currency } = useEvent();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState<boolean>(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState<boolean>(false);
  const [selectedVendorForQuote, setSelectedVendorForQuote] = useState<Vendor | null>(null);

  // AI comparison summary state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Form state for vendor
  const [vendorForm, setVendorForm] = useState<{
    name: string;
    category: any;
    location: string;
    contactPerson: string;
    email: string;
    phone: string;
    notes: string;
  }>({
    name: '',
    category: 'Catering',
    location: 'Kolkata, WB',
    contactPerson: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Form state for quotation
  const [quoteForm, setQuoteForm] = useState<{
    basePrice: number;
    taxes: number;
    transportationFee: number;
    setupFee: number;
    additionalCharges: number;
    includedServices: string;
    notes: string;
  }>({
    basePrice: 25000,
    taxes: 1250,
    transportationFee: 500,
    setupFee: 0,
    additionalCharges: 0,
    includedServices: 'Full service catering, chafing dishes, 10 staff',
    notes: '',
  });

  if (!activeEvent) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">No active event selected.</div>;
  }

  const vendors = activeEvent.vendors || [];
  const filteredVendors = selectedCategory === 'all'
    ? vendors
    : vendors.filter((v) => v.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleOpenAddVendor = () => {
    setVendorForm({
      name: '',
      category: 'Catering',
      location: activeEvent.location || 'Kolkata, WB',
      contactPerson: '',
      email: '',
      phone: '',
      notes: '',
    });
    setIsAddVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;

    addVendor({
      name: vendorForm.name,
      category: vendorForm.category,
      location: vendorForm.location,
      contactPerson: vendorForm.contactPerson,
      email: vendorForm.email,
      phone: vendorForm.phone,
      rating: 4.8,
      isVerifiedDemo: false,
      notes: vendorForm.notes,
      quotations: [],
    });

    setIsAddVendorModalOpen(false);
  };

  const handleOpenAddQuote = (vendor: Vendor) => {
    setSelectedVendorForQuote(vendor);
    setQuoteForm({
      basePrice: 20000,
      taxes: 1000,
      transportationFee: 500,
      setupFee: 0,
      additionalCharges: 0,
      includedServices: 'Detailed services package breakdown',
      notes: '',
    });
    setIsAddQuoteModalOpen(true);
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForQuote) return;

    addVendorQuotation(selectedVendorForQuote.id, {
      basePrice: Number(quoteForm.basePrice) || 0,
      taxes: Number(quoteForm.taxes) || 0,
      transportationFee: Number(quoteForm.transportationFee) || 0,
      setupFee: Number(quoteForm.setupFee) || 0,
      additionalCharges: Number(quoteForm.additionalCharges) || 0,
      includedServices: quoteForm.includedServices.split(',').map((s) => s.trim()),
      notes: quoteForm.notes,
      status: 'shortlisted',
    });

    setIsAddQuoteModalOpen(false);
  };

  const handleCompareWithAI = async () => {
    setIsComparing(true);
    try {
      const response = await fetch(apiUrl('/api/ai/compare-vendors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory === 'all' ? 'All Event' : selectedCategory,
          vendors: filteredVendors,
        }),
      });
      const data = await response.json();
      setAiSummary(data);
    } catch (e) {
      console.error('Vendor comparison error:', e);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              Procurement & Quotations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)] mt-1">
            Vendor Comparison Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Normalize quotes across base rates, taxes, and setup logistics for transparent evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCompareWithAI}
            disabled={isComparing || filteredVendors.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />
            <span>AI Comparative Analysis</span>
          </button>
          <button
            onClick={handleOpenAddVendor}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* AI Comparative Summary Banner */}
      {aiSummary && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-900 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-900 dark:text-violet-200">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>AI Strategic Procurement Assessment</span>
            </div>
            <button
              onClick={() => setAiSummary(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[var(--text-main)] leading-relaxed">{aiSummary.summary}</p>
          {aiSummary.keyHighlights && (
            <div className="flex flex-wrap gap-2 pt-1">
              {aiSummary.keyHighlights.map((h: string, i: number) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-[var(--border-main)] font-medium text-[var(--text-main)]"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Catering', 'Decorations', 'Photography', 'Venue', 'Entertainment'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {cat === 'all' ? 'All Vendors' : cat}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => {
          const primaryQuote = vendor.quotations[0];
          const totalCalculated = primaryQuote
            ? primaryQuote.basePrice +
              primaryQuote.taxes +
              primaryQuote.transportationFee +
              primaryQuote.setupFee +
              primaryQuote.additionalCharges
            : 0;

          return (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {vendor.category}
                    </span>
                    {vendor.isVerifiedDemo && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        Demonstration Record
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold font-display text-[var(--text-main)] mt-1">
                    {vendor.name}
                  </h3>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-violet-500" />
                    <span>{vendor.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                    aria-label="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{vendor.phone || 'No phone entered'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-500" />
                  <span className="truncate">{vendor.email || 'No email entered'}</span>
                </div>
              </div>

              {/* Quotation Breakdown */}
              {primaryQuote ? (
                <div className="space-y-2.5 p-3 rounded-xl border border-violet-100 dark:border-violet-950 bg-violet-50/30 dark:bg-violet-950/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-main)]">Normalized Quotation</span>
                    <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400">
                      Total: {formatCurrency(totalCalculated, currency)}
                    </span>
                  </div>

                  {/* Fee itemization */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-[var(--text-muted)]">
                    <div>
                      <span>Base:</span> <strong className="text-[var(--text-main)]">{formatCurrency(primaryQuote.basePrice, currency)}</strong>
                    </div>
                    <div>
                      <span>Taxes:</span> <strong className="text-[var(--text-main)]">{formatCurrency(primaryQuote.taxes, currency)}</strong>
                    </div>
                    <div>
                      <span>Transit:</span> <strong className="text-[var(--text-main)]">{formatCurrency(primaryQuote.transportationFee, currency)}</strong>
                    </div>
                    <div>
                      <span>Setup:</span> <strong className="text-[var(--text-main)]">{formatCurrency(primaryQuote.setupFee, currency)}</strong>
                    </div>
                  </div>

                  {/* Included Services */}
                  {primaryQuote.includedServices && primaryQuote.includedServices.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">Included in Package:</span>
                      <div className="flex flex-wrap gap-1">
                        {primaryQuote.includedServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-[var(--border-main)] text-[var(--text-main)] font-medium"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center rounded-xl bg-[var(--bg-card-subtle)] border border-dashed border-[var(--border-main)] text-xs text-[var(--text-muted)]">
                  No quotation entered yet.
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Contact: <strong>{vendor.contactPerson || 'Direct'}</strong>
                </span>
                <button
                  onClick={() => handleOpenAddQuote(vendor)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-violet-100 dark:hover:bg-zinc-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 transition-colors"
                >
                  {primaryQuote ? 'Add / Update Quote' : '+ Enter Quotation'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVendor}
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                Add New Vendor
              </h3>
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Royal Bengal Caterers"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value as any })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  >
                    {['Catering', 'Decorations', 'Photography', 'Venue', 'Entertainment', 'Transportation', 'Equipment'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Location</label>
                  <input
                    type="text"
                    value={vendorForm.location}
                    onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Contact Person</label>
                  <input
                    type="text"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    placeholder="e.g. S. Sen"
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Phone Number</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 98300 00000"
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Email Address</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="contact@vendor.com"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Save Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Update Quotation Modal */}
      {isAddQuoteModalOpen && selectedVendorForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuote}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                  Enter Normalized Quotation
                </h3>
                <span className="text-xs text-violet-600 font-semibold">{selectedVendorForQuote.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuoteModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Base Price ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.basePrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, basePrice: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Taxes & GST ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.taxes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, taxes: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Transportation / Delivery ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.transportationFee}
                    onChange={(e) => setQuoteForm({ ...quoteForm, transportationFee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Setup / Labor Fees ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.setupFee}
                    onChange={(e) => setQuoteForm({ ...quoteForm, setupFee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">
                  Included Services (comma separated)
                </label>
                <input
                  type="text"
                  value={quoteForm.includedServices}
                  onChange={(e) => setQuoteForm({ ...quoteForm, includedServices: e.target.value })}
                  placeholder="e.g. 200 plates, chafing dishes, live counter, 12 waitstaff"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsAddQuoteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Save Quotation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
