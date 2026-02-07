import { Users, FolderKanban, Calendar, LayoutDashboard, UserCog, Layers } from 'lucide-react';

export const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Sub-Projects', href: '/admin/sub-projects', icon: FolderKanban },
    { name: 'Employees', href: '/admin/employees', icon: Users },
    { name: 'Allocations', href: '/admin/allocations', icon: UserCog },
    { name: 'Leaves', href: '/admin/leaves', icon: Calendar },
];
