const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/app/admin/complaints/page.tsx', regex: /AlertTriangle,\s*XCircle,?/g, replace: '' },
  { file: 'src/app/admin/complaints/page.tsx', regex: /getTrustLevel,?/g, replace: '' },
  { file: 'src/app/admin/revenue/page.tsx', regex: /CheckCircle2,\s*AlertTriangle,\s*Users,\s*Box,\s*MapPin,\s*TrendingUp,?/g, replace: '' },
  { file: 'src/app/admin/revenue/page.tsx', regex: /const demoStep.*?\n/g, replace: '' },
  { file: 'src/app/api/generate-csr-report/route.tsx', regex: /const dailyData/g, replace: 'const _dailyData' },
  { file: 'src/app/csr/page.tsx', regex: /BarChart3,\s*Download,?/g, replace: '' },
  { file: 'src/app/donate/page.tsx', regex: /import Image from "next\/image";?/g, replace: '' },
  { file: 'src/app/donate/page.tsx', regex: /CheckCircle2,\s*AlertTriangle,\s*ShieldCheck,?/g, replace: '' },
  { file: 'src/app/donate/page.tsx', regex: /FOOD_ROUTING_MATRIX,?/g, replace: '' },
  { file: 'src/app/donate/page.tsx', regex: /const \[expiryHours, setExpiryHours\] = useState\(24\);/g, replace: 'const [expiryHours] = useState(24);' },
  { file: 'src/app/donate/page.tsx', regex: /const listing =/g, replace: 'const _listing =' },
  { file: 'src/app/driver/dashboard/page.tsx', regex: /Award,\s*TrendingUp,\s*Package,\s*Bell,?/g, replace: '' },
  { file: 'src/app/driver/dashboard/page.tsx', regex: /\s*const co2Saved = .*?\n/g, replace: '\n' },
  { file: 'src/app/driver/deliveries/page.tsx', regex: /AnimatePresence,\s*Navigation,\s*Clock,?/g, replace: '' },
  { file: 'src/app/driver/earnings/page.tsx', regex: /const \[loading, setLoading\]/g, replace: 'const [_loading, setLoading]' },
  { file: 'src/app/driver/pickup/[id]/page.tsx', regex: /catch \(err\)/g, replace: 'catch (_err)' },
  { file: 'src/app/drivers/join/page.tsx', regex: /Globe,\s*Award,?/g, replace: '' },
  { file: 'src/app/impact/page.tsx', regex: /Bell,\s*Settings,?/g, replace: '' },
  { file: 'src/app/impact/page.tsx', regex: /const \[energyKwh, setEnergyKwh\]/g, replace: 'const [energyKwh]' },
  { file: 'src/app/impact/page.tsx', regex: /const \[compostKg, setCompostKg\]/g, replace: 'const [compostKg]' },
  { file: 'src/app/map/page.tsx', regex: /Building2,\s*HeartHandshake,\s*Gauge,\s*Play,?/g, replace: '' },
  { file: 'src/app/map/page.tsx', regex: /const pendingCount/g, replace: 'const _pendingCount' },
  { file: 'src/app/map/page.tsx', regex: /\.map\(\(item, i\)/g, replace: '.map((item)' },
  { file: 'src/app/onboarding/page.tsx', regex: /const userId/g, replace: 'const _userId' },
  { file: 'src/app/partners/dashboard/[id]/page.tsx', regex: /useEffect,?/g, replace: '' },
  { file: 'src/app/partners/dashboard/[id]/page.tsx', regex: /TrendingUp,\s*Clock,?/g, replace: '' },
  { file: 'src/app/partners/subscription/page.tsx', regex: /Star,\s*Crown,\s*ArrowRight,?/g, replace: '' },
  { file: 'src/app/partners/valorization/page.tsx', regex: /ChevronRight,\s*Zap,\s*TrendingUp,?/g, replace: '' },
  { file: 'src/app/receiver/page.tsx', regex: /Network,\s*LineChart,\s*Megaphone,\s*MapPin,\s*Navigation,\s*CheckCircle2,\s*User,\s*Fish,?/g, replace: '' },
  { file: 'src/app/receiver/page.tsx', regex: /import Lottie from "lottie-react";?\n/g, replace: '' },
  { file: 'src/app/receiver/page.tsx', regex: /import emptyBowlData.*?\n/g, replace: '' },
  { file: 'src/app/settings/page.tsx', regex: /Moon,\s*Globe,?/g, replace: '' },
  { file: 'src/app/test/page.tsx', regex: /const { data, error }/g, replace: 'const { error }' },
  { file: 'src/app/test/page.tsx', regex: /\s*const getIcon = .*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n/g, replace: '\n' },
  { file: 'src/app/zero-waste/page.tsx', regex: /Wheat,\s*CloudRain,?/g, replace: '' },
  { file: 'src/app/zero-waste/page.tsx', regex: /const totalCo2 =/g, replace: 'const _totalCo2 =' },
  { file: 'src/components/AIThinkingModal.tsx', regex: /const bestPartnerType/g, replace: 'const _bestPartnerType' },
  { file: 'src/components/FoodCard.tsx', regex: /Clock,?/g, replace: '' },
  { file: 'src/components/FoodCard.tsx', regex: /cn,?/g, replace: '' },
  { file: 'src/lib/supabase/server.ts', regex: /catch \(_error\)/g, replace: 'catch' },
  { file: 'src/middleware.ts', regex: /options: _options/g, replace: 'options: _' }
];

for (let r of replacements) {
  try {
    let content = fs.readFileSync(r.file, 'utf8');
    content = content.replace(r.regex, r.replace);
    // clean up empty lucide-react imports
    content = content.replace(/import {\s*} from "lucide-react";?\n/g, '');
    fs.writeFileSync(r.file, content);
  } catch(e) {}
}

// Manually process next/image replacements
const filesWithImages = [
  {
    file: 'src/app/profile/page.tsx',
    regex: /<img\s*src=\{profile\.avatar_url\}\s*alt="Profile Photo"\s*className="w-24 h-24 rounded-full object-cover border-4 border-\[#08090A\] shadow-xl"\s*\/>/g,
    replace: `<Image src={profile.avatar_url || '/default-avatar.png'} alt="Profile Photo" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-4 border-[#08090A] shadow-xl" />`
  },
  {
    file: 'src/app/receiver/page.tsx',
    regex: /<img\s*src=\{l\.profiles\?\.avatar_url\}\s*alt="Provider"\s*className="w-12 h-12 rounded-full object-cover shrink-0 border border-white\/10"\s*\/>/g,
    replace: `<Image src={l.profiles?.avatar_url || '/default-avatar.png'} alt="Provider" width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10" />`
  },
  {
    file: 'src/components/Navbar.tsx',
    regex: /<img\s*src=\{profile\.avatar_url\}\s*alt="Profile"\s*className="w-8 h-8 rounded-full border border-white\/20"\s*\/>/g,
    replace: `<Image src={profile.avatar_url || '/default-avatar.png'} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full border border-white/20" />`
  },
  {
    file: 'src/components/Navbar.tsx',
    regex: /<img\s*src=\{profile\.avatar_url\}\s*alt="Profile"\s*className="w-10 h-10 rounded-full border border-white\/20"\s*\/>/g,
    replace: `<Image src={profile.avatar_url || '/default-avatar.png'} alt="Profile" width={40} height={40} className="w-10 h-10 rounded-full border border-white/20" />`
  }
];

for (let r of filesWithImages) {
  try {
    let content = fs.readFileSync(r.file, 'utf8');
    if (!content.includes('import Image from "next/image"')) {
       // Insert import at the top
       content = 'import Image from "next/image";\n' + content;
    }
    content = content.replace(r.regex, r.replace);
    fs.writeFileSync(r.file, content);
  } catch(e) {}
}

console.log("Replacements complete.");
