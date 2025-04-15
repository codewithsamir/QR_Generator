"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react"; // Removed Laptop icon

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false); // State to track mounting

  // Ensure component is mounted on the client before rendering theme-specific UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light"); // Simple toggle
  };

  // Render nothing or a placeholder until mounted
  if (!mounted) {
    // Render a placeholder button or null to avoid mismatch
    return <Button variant="ghost" size="icon" disabled={true} aria-label="Toggle theme" className="h-[1.2rem] w-[1.2rem]"></Button>; 
  }

  // Determine current icon based on theme
  const Icon = theme === "light" ? Sun : Moon;

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Icon className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
} 