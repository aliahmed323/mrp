import { useState, useEffect } from 'react';
import { db } from '@/services/storage/db';
import { Plus, Search, Trash2, Phone, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { ConfirmDialog } from '@/components/ui/Dialog';
import toast from 'react-hot-toast';

export function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', category: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadContacts = async () => {
    setLoading(true);
    const data = await db.contacts.toArray();
    setContacts(data.reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('يرجى إدخال الاسم ورقم الهاتف');
    
    await db.contacts.add({
      id: crypto.randomUUID(),
      name: formData.name,
      phone: formData.phone,
      category: formData.category || 'عام',
      createdAt: new Date().toISOString()
    });
    
    toast.success('تم إضافة جهة الاتصال');
    setFormData({ name: '', phone: '', category: '' });
    setModalOpen(false);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    await db.contacts.delete(id);
    toast.success('تم الحذف');
    setConfirmDelete(null);
    loadContacts();
  };

  const handleImport = async () => {
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const supportedContacts = await (navigator as any).contacts.select(props, opts);
        
        let count = 0;
        for (const c of supportedContacts) {
          if (c.tel && c.tel.length > 0) {
            await db.contacts.add({
              id: crypto.randomUUID(),
              name: c.name?.[0] || 'بدون اسم',
              phone: c.tel[0],
              category: 'مستورد',
              createdAt: new Date().toISOString()
            });
            count++;
          }
        }
        if (count > 0) {
          toast.success(`تم استيراد ${count} جهة اتصال`);
          loadContacts();
        } else {
          toast.error('لم يتم العثور على أرقام هواتف');
        }
      } else {
        toast.error('ميزة الاستيراد غير مدعومة في متصفحك (تتطلب متصفح Chrome على Android). يمكنك الإضافة يدوياً.');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الاستيراد أو تم الإلغاء');
    }
  };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="space-y-4 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">جهات الاتصال</h2>
          <p className="text-sm text-slate-500">{contacts.length} جهة اتصال مسجلة</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleImport}>
            <Download size={16} className="mr-1" /> استيراد
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={16} className="mr-1" /> إضافة
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-11">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث بالاسم أو الرقم..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      <div className="space-y-3 mt-4">
        {filtered.map(contact => (
          <div key={contact.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">{contact.name}</div>
              <div className="text-xs text-slate-500 mt-1">{contact.category} • {contact.phone}</div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="واتساب"
              >
                <Phone size={16} />
              </a>
              <button
                onClick={() => setConfirmDelete(contact.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            لا توجد جهات اتصال
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900">إضافة جهة اتصال</h3>
            <Input label="الاسم" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="رقم الهاتف" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} type="tel" required />
            <Input label="التصنيف (اختياري)" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="مثال: طبيب، صديق، مندوب..." />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => setModalOpen(false)}>إلغاء</Button>
              <Button type="submit" fullWidth>حفظ</Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="حذف جهة اتصال"
        message="هل أنت متأكد من الحذف؟"
        confirmLabel="حذف"
        variant="danger"
      />
    </div>
  );
}
