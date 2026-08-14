/**
 * Ikon LoopLink — kompatibilitas nama dengan desain lama.
 *
 * Mulai Fase 4.1/4.2, semua ikon memakai set identik dengan design
 * reference (Figma Make): lucide-react. Nama ekspor (Icon*) tetap sama
 * supaya seluruh pemakai lama (`<Icon className="h-4 w-4" />`) tidak
 * perlu diubah — lucide menerima `className`, `size`, `strokeWidth`.
 */

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Eye,
  EyeOff,
  Home,
  Info,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  Package,
  PenLine,
  Recycle,
  Search,
  ShieldCheck,
  Users,
  Upload,
  X,
  Zap,
} from "lucide-react";

export const IconUpload = Upload;
export const IconSearch = Search;
export const IconSpark = Zap;
export const IconCamera = Camera;
export const IconMapPin = MapPin;
export const IconNav = Navigation;
export const IconMail = Mail;
export const IconLock = Lock;
export const IconEye = Eye;
export const IconEyeOff = EyeOff;
export const IconLogOut = LogOut;
export const IconHome = Home;
export const IconArrowRight = ArrowRight;
export const IconArrowLeft = ArrowLeft;
export const IconCheck = Check;
export const IconAlert = AlertTriangle;
export const IconInfo = Info;
export const IconPackage = Package;
export const IconUsers = Users;
export const IconShield = ShieldCheck;
export const IconRecycle = Recycle;
export const IconLeaf = Leaf;
export const IconPen = PenLine;
export const IconX = X;