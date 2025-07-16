'use client';

import { Button, Dropdown, type MenuProps } from "antd";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks";

interface ThemeToggleProps {
    showLabel?: boolean;
    className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
    const { theme, setTheme/*, isDark*/ } = useTheme();

    const items: MenuProps['items'] = [
        {
            key: 'light',
            label: 'Светлая',
            icon: <Sun size={16} />,
            onClick: () => setTheme('light'),
        },
        {
            key: 'dark',
            label: 'Темная',
            icon: <Moon size={16} />,
            onClick: () => setTheme('dark'),
        },
        {
            key: 'system',
            label: 'Системная',
            icon: <Monitor size={16} />,
            onClick: () => setTheme('system'),
        },
    ];

    const currentIcon = theme === 'light'
        ? <Sun size={20} />
        : theme === 'dark'
            ? <Moon size={20} />
            : <Monitor size={20} />;

    return (
        <Dropdown
            menu={{
                items,
                selectedKeys: [theme],
            }}
            placement="bottomRight"
            trigger={['click']}
        >
            <Button
                type="text"
                icon={currentIcon}
                className={className}
            >
                {showLabel && (
                    <span className="ml-2">
            {theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Темная' : 'Системная'}
          </span>
                )}
            </Button>
        </Dropdown>
    );
}