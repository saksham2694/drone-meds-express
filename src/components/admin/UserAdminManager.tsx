
import { useState } from "react";
import { makeUserAdmin } from "@/services/medicineService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function UserAdminManager() {
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await makeUserAdmin(userId);
      
      if (success) {
        toast({
          title: "Success",
          description: "User has been granted admin privileges.",
        });
        setUserId("");
      } else {
        toast({
          title: "Error",
          description: "Failed to make user an admin. They might already be an admin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Admin Users</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter a user ID to grant them admin privileges.
            </p>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="User ID (from Supabase auth.users table)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Note: You can find user IDs in the Supabase dashboard under Authentication &gt; Users.
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Make Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
