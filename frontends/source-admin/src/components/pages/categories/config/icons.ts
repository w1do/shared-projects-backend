import {
  Droplet,
  Sparkles,
  Flower,
  Waves,
  Eye,
  Sun,
  Wind,
  Smile,
  Heart,
  Gift,
  CircleDot,
  Folder,
} from "lucide-react";

export const iconOptions = [
  { name: "Droplet", icon: Droplet },
  { name: "Sparkles", icon: Sparkles },
  { name: "Flower", icon: Flower },
  { name: "Waves", icon: Waves },
  { name: "Eye", icon: Eye },
  { name: "Sun", icon: Sun },
  { name: "Wind", icon: Wind },
  { name: "Smile", icon: Smile },
  { name: "Heart", icon: Heart },
  { name: "Gift", icon: Gift },
  { name: "CircleDot", icon: CircleDot },
];

export const iconMap = Object.fromEntries(iconOptions.map((option) => [option.name, option.icon]));

export const getCategoryIcon = (iconName?: string | null) => {
  return (iconName && iconMap[iconName]) || Folder;
};
