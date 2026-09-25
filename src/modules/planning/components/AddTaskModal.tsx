import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';
import { usePharmacyStore } from '@/modules/pharmacies/hooks/usePharmacyStore';
import { useProductStore } from '@/modules/products/hooks/useProductStore';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: any) => void;
}

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const { doctors, loadDoctors } = useDoctorStore();
  const { pharmacies, loadPharmacies } = usePharmacyStore();
  const { products, loadProducts } = useProductStore();
  
  const [type, setType] = useState<'doctor' | 'pharmacy'>('doctor');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [action, setAction] = useState<'product_pitch' | 'product_follow_up' | 'all_products' | 'general'>('general');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      loadPharmacies();
      loadProducts();
    }
  }, [isOpen, loadDoctors, loadPharmacies, loadProducts]);

  if (!isOpen) return null;

  const list = type === 'doctor' ? doctors : pharmacies;
  const filtered = list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) && !item.archived).slice(0, 10);

  const handleSave = () => {
    if (!selectedEntity) return;
    
    const productNames = products
      .filter(p => selectedProducts.includes(p.id))
      .map(p => p.productName);
    
    onAdd({
      type,
      entityId: selectedEntity.id,
      entityName: selectedEntity.name,
      action,
      productNames,
      notes,
      status: 'pending'
    });
    
    // Reset
    setSelectedEntity(null);
    setSearch('');
    setNotes('');
    setAction('general');
    setSelectedProducts([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800">إضافة مهمة جديدة</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => { setType('doctor'); setSelectedEntity(null); setSearch(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'doctor' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
            >
              طبيب
            </button>
            <button
              onClick={() => { setType('pharmacy'); setSelectedEntity(null); setSearch(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'pharmacy' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-600'}`}
            >
              صيدلية
            </button>
          </div>

          {!selectedEntity ? (
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={`ابحث عن ${type === 'doctor' ? 'طبيب' : 'صيدلية'}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filtered.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEntity(item)}
                    className="w-full text-right p-3 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-blue-100"
                  >
                    {item.name}
                  </button>
                ))}
                {filtered.length === 0 && search && (
                  <p className="text-center text-xs text-slate-400 py-4">لا توجد نتائج</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div>
                  <p className="text-[10px] text-blue-600 font-bold mb-0.5">{type === 'doctor' ? 'الطبيب المحدد' : 'الصيدلية المحددة'}</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEntity.name}</p>
                </div>
                <button onClick={() => setSelectedEntity(null)} className="text-xs text-blue-600 bg-white px-2 py-1 rounded-md shadow-sm">تغيير</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">ما هو الهدف من الزيارة؟</label>
                <select
                  value={action}
                  onChange={(e: any) => setAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="general">زيارة عامة</option>
                  <option value="product_pitch">عرض منتج جديد</option>
                  <option value="product_follow_up">متابعة منتج</option>
                  <option value="all_products">تذكير بجميع المنتجات</option>
                </select>
              </div>

              {(action === 'product_pitch' || action === 'product_follow_up') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">المنتجات (اختياري)</label>
                  <div className="flex flex-wrap gap-2">
                    {products.filter(p => !p.archived).map(product => {
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            if (isSelected) setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            else setSelectedProducts([...selectedProducts, product.id]);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {product.productName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="أضف أي تفاصيل تود تذكرها قبل الزيارة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none h-24"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">إلغاء</Button>
          <Button onClick={handleSave} disabled={!selectedEntity} className="flex-1 bg-blue-600 hover:bg-blue-700">إضافة للخطة</Button>
        </div>
      </div>
    </div>
  );
}
