"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

export function UnauthorizedScreen() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="flex size-32 items-center justify-center rounded-3xl bg-destructive/10 text-destructive animate-pulse">
          <ShieldAlert className="size-16" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-openrunde text-3xl font-semibold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            You do not have the required permissions to view this section of the console. Please
            contact your system administrator if you believe this is an error.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="outlined"
            shape="circle"
            size="lg"
            startIcon={<ArrowLeft />}
            onClick={() => router.push("/admin")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
