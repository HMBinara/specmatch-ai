import React from 'react';
import { useNavigate } from 'react-router-dom';   // <-- මේක import කරලා තියෙනවද check කරන්න
import { Upload, FileText, Target, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { id: 'upload', label: 'Ingest Talent', icon: Upload },
    { id: 'rfp', label: 'Analyze RFP', icon: FileText },
    { id: 'match', label: 'Run Fitment', icon: Target },
];

export default function Sidebar({ activeTab, setActiveTab }) {
    const { companyName, logout } = useAuth();
    const navigate = useNavigate();   // <-- මේ line එකත් තියෙනවද check කරන්න

    const handleLogout = async () => {
        await logout();
        // navigate() ඕන නෑ - currentUser null වුනාම ProtectedRoute එකෙන්ම "/" ට redirect කරනවා
    };

    return (
        <aside className="w-60 shrink-0 bg-[#1c2027] border-r border-[#2c313a] min-h-screen flex flex-col">
            <div className="p-5 border-b border-[#2c313a]">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#0e1013] border border-[#2c313a] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#5eead4]" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-body text-sm font-600 text-[#eef0f3] truncate">
                            {companyName || 'Your workspace'}
                        </p>
                        <p className="font-mono text-[10px] text-[#5b636e] uppercase tracking-wider">
                            Workspace
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-all
                ${active ? 'bg-[#0e1013] text-[#eef0f3]' : 'text-[#8b93a0] hover:bg-[#0e1013]/50 hover:text-[#dfe2e6]'}`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-[#2c313a]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body text-[#8b93a0] hover:bg-[#fb7862]/10 hover:text-[#fb7862] transition-all"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Log out
                </button>
            </div>
        </aside>
    );
}