"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/inputs/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/overlay/dropdown-menu";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { mockUsers, type MockUser } from "@/lib/admin/mocks/auth";

interface DemoAccountSelectorProps {
  showDemo?: boolean;
  onSelectUser: (user: MockUser) => void;
}

export function DemoAccountSelector({ showDemo = false, onSelectUser }: DemoAccountSelectorProps) {
  if (!showDemo) return null;

  return (
    <div className="absolute top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outlined"
            shape="circle"
            size="sm"
            startIcon={<Sparkles className="size-4 text-brand-accent animate-pulse" />}
          >
            Demo Accounts
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
          <DropdownMenuLabel className="font-semibold text-caption text-muted-foreground uppercase tracking-wider">
            Select a Demo Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mockUsers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onSelect={() => onSelectUser(user)}
              className="flex items-center gap-4 py-2 px-4 cursor-pointer transition-colors hover:bg-muted"
            >
              <Avatar size="sm" src={user.avatar} fallback={user.name.slice(0, 2).toUpperCase()} />
              <div className="flex flex-col min-w-0 flex-1 leading-tight">
                <span className="text-xs font-semibold text-foreground truncate">{user.name}</span>
                <span className="text-caption text-muted-foreground-lighter truncate">
                  {user.email}
                </span>
              </div>
              <Badge
                variant="soft"
                shape="circle"
                color={
                  user.role === "admin"
                    ? "primary"
                    : user.role === "manager"
                      ? "warning"
                      : "neutral"
                }
                className="shrink-0 text-caption scale-90"
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
