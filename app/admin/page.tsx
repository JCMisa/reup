"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Shield, Users } from "lucide-react";
import { isAdmin } from "@/lib/utils";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Check if user is admin
  if (isLoaded && user) {
    if (!isAdmin(user.primaryEmailAddress?.emailAddress)) {
      router.push("/invite");
      return null;
    }
  }

  const handleGenerateCodes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/generate-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Generated ${data.codes.length} invite codes!`);
        setGeneratedCodes(data.codes);
      } else {
        toast.error(data.error || "Failed to generate invite codes");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {user.firstName || user.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Generate Invite Codes */}
          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Generate Invite Codes</CardTitle>
                  <CardDescription>
                    Create new invite codes for users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of codes to generate</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleGenerateCodes}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Codes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Info */}
          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Admin Access</CardTitle>
                  <CardDescription>
                    You have full access to all features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                <p>
                  <strong>Role:</strong> Administrator
                </p>
                <p>
                  <strong>Access:</strong> All pages and features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Codes */}
        {generatedCodes.length > 0 && (
          <Card className="mt-6 border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Generated Invite Codes</CardTitle>
                  <CardDescription>
                    Share these codes with users who need access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {generatedCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
