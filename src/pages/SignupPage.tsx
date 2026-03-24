import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader as Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('هذا البريد الإلكتروني مسجل مسبقاً');
        } else {
          toast.error('خطأ في إنشاء الحساب', { description: error.message });
        }
      } else {
        toast.success('تم إنشاء الحساب بنجاح');
        navigate('/');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-ui text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="font-ui text-sm text-muted-foreground">
            انضم إلى تجويد وابدأ رحلتك مع القرآن الكريم
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-ui">الاسم الكامل</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="محمد أحمد"
              className="font-ui text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-ui">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="font-ui text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-ui">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="font-ui text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-ui">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد كتابة كلمة المرور"
              className="font-ui text-right"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-ui text-base"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ إنشاء الحساب...
              </>
            ) : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء حساب
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="font-ui text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="font-ui text-sm text-muted-foreground hover:text-primary"
          >
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
