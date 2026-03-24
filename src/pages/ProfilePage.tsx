import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User, Mail, LogOut, Loader as Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) {
        toast.error('خطأ في تحديث الملف الشخصي', { description: error.message });
      } else {
        toast.success('تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-primary transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">الملف الشخصي</h1>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-ui text-lg font-bold">{profile?.full_name || 'مستخدم'}</p>
            <p className="font-ui text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-ui">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="pr-10 font-ui text-right bg-muted/50"
                dir="rtl"
              />
            </div>
            <p className="font-ui text-xs text-muted-foreground">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-ui">الاسم الكامل</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="font-ui text-right"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-ui"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-primary/10">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full font-ui text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>

        <div className="rounded-xl border border-primary/10 bg-muted/30 p-4 space-y-2">
          <p className="font-ui text-sm font-bold">معلومات الحساب</p>
          <div className="space-y-1 font-ui text-xs text-muted-foreground">
            <p>تاريخ الإنشاء: {new Date(profile?.created_at || '').toLocaleDateString('ar-SA')}</p>
            <p>آخر تحديث: {new Date(profile?.updated_at || '').toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
