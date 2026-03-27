import { Link } from 'react-router-dom';
import { X, Home, Search, Sparkles, Clock, Settings, BookOpen, Brain, BookMarked, Sun, Heart } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/search', icon: Search, label: 'البحث' },
  { path: '/ai', icon: Sparkles, label: 'AI' },
  { path: '/prayer-times', icon: Clock, label: 'الصلاة' },
  { path: '/dhikr', icon: Sun, label: 'الأذكار' },
  { path: '/names-of-allah', icon: Heart, label: 'أسماء الله' },  // <-- جديد
  { path: '/memorize', icon: Brain, label: 'الحفظ' },
  { path: '/bookmarks', icon: BookMarked, label: 'العلامات المرجعية' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];
