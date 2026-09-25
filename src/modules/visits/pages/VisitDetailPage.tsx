import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Trash2, Package, CheckCircle2, MessageSquare, AlertCircle, Pencil } from 'lucide-react';
import { getVisitById } from '@/services/storage/visitRepository';
import { useVisitStore } from '../hooks/useVisitStore';
import type { Visit } from '../models/visit.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { VISIT_TYPE_ICONS, VISIT_TYPE_LABELS } from '../models/visit.model';

export function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { removeVisit } = useVisitStore();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getVisitById(id).then(v => { setVisit(v ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!visit) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await removeVisit(visit.id);
      navigate('/visits', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  const entityLink = 
    visit.type === 'doctor' ? `/doctors/${visit.entityId}` :
    visit.type === 'pharmacy' ? `/pharmacies/${visit.entityId}` :
    `/clinics/${visit.entityId}`;

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/visits/${visit.id}/edit`)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
              <Pencil size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 size={14} /> حذف
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={16} /> {visit.date}
              <span className="text-slate-300">|</span>
              <Clock size={16} /> {visit.time}
            </div>
            <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1">
              {VISIT_TYPE_ICONS[visit.type]} {VISIT_TYPE_LABELS[visit.type]}
            </span>
          </div>
          
          <div className="p-5">
            <Link to={entityLink} className="group block">
              <h1 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {visit.entityName}
              </h1>
              <p className="text-xs text-slate-500 mt-1">انقر لعرض ملف الجهة</p>
            </Link>
            {visit.doctorName && (
              <p className="text-sm font-medium text-indigo-600 mt-2">
                الطبيب المرتبط: {visit.doctorName}
              </p>
            )}
          </div>
        </div>

        {/* Outcomes */}
        {visit.outcomes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-500" /> حالة الزيارة
            </h3>
            <div className="flex flex-wrap gap-2">
              {visit.outcomes.map((out, i) => (
                <span key={i} className="text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100 font-medium">
                  {out}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {visit.productNames.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Package size={16} className="text-orange-500" /> المنتجات المناقشة
            </h3>
            <ul className="space-y-2">
              {visit.productNames.map((name, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feedback */}
        {visit.feedback && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-500" /> الملاحظات
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{visit.feedback}</p>
          </div>
        )}

        {/* Follow Up */}
        {visit.followUpRequired && (
          <div className="bg-orange-50 rounded-2xl border border-orange-100 shadow-sm p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-orange-800">تتطلب متابعة</h3>
              {visit.followUpDate && (
                <p className="text-sm text-orange-700 mt-1 font-medium">تاريخ المتابعة: {visit.followUpDate}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog 
        open={confirmDelete} 
        onClose={() => setConfirmDelete(false)} 
        onConfirm={handleDelete} 
        title="حذف الزيارة" 
        message="هل أنت متأكد من حذف هذه الزيارة نهائياً؟" 
        confirmLabel="حذف" 
        variant="danger" 
        loading={actionLoading} 
      />
    </>
  );
}
