import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader as Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('خطأ في تسجيل الدخول', {
          description: error.message === 'Invalid login credentials'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : error.message,
        });
      } else {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate(from, { replace: true });
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
          <h1 className="font-ui text-2xl font-bold">تسجيل الدخول</h1>
          <p className="font-ui text-sm text-muted-foreground">
            ادخل إلى حسابك في تجويد
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
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
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="font-ui text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              إنشاء حساب جديد
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
