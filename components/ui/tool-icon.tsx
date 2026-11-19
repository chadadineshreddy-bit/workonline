import React from "react";
import {
  FileText,
  FileType,
  Layers,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  Edit3,
  FileEdit,
  Award,
  Hourglass,
  GraduationCap,
  Clock,
  Calendar,
  BookOpen,
  HelpCircle,
  Sparkles,
  Briefcase,
  MailCheck,
  Send,
  CheckSquare,
  Table,
  CreditCard,
  Sliders,
  RefreshCw,
  Bot,
  FileSpreadsheet,
  Wand2,
  MessageSquare,
  Cpu,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileCheck,
  Eye,
  File,
  LucideIcon
} from "lucide-react";

interface ToolIconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  FileType,
  Layers,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  Edit3,
  FileEdit,
  Award,
  Hourglass,
  GraduationCap,
  Clock,
  Calendar,
  BookOpen,
  HelpCircle,
  Sparkles,
  Briefcase,
  MailCheck,
  Send,
  CheckSquare,
  Table,
  CreditCard,
  Sliders,
  RefreshCw,
  Bot,
  FileSpreadsheet,
  Wand2,
  MessageSquare,
  Cpu,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileCheck,
  Eye,
};

export function ToolIcon({ name, className = "w-6 h-6" }: ToolIconProps) {
  const IconComponent = iconMap[name] || File;
  return <IconComponent className={className} />;
}
