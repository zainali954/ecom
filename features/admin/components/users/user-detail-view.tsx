"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AdminUser } from "@/types/admin";
import { UserActions } from "./user-actions";

interface UserDetailViewProps {
  user: AdminUser;
  isSelf: boolean;
}

export function UserDetailView({ user, isSelf }: UserDetailViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <UserActions user={user} isSelf={isSelf} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
            <Badge variant={user.isActive ? "outline" : "destructive"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            {user.emailVerified ? (
              <Badge variant="outline">Email Verified</Badge>
            ) : (
              <Badge variant="secondary">Email Not Verified</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Full Name" value={user.name} />
          <Separator />
          <DetailRow label="Email" value={user.email} />
          <Separator />
          <DetailRow label="Role" value={user.role} />
          <Separator />
          <DetailRow label="Status" value={user.isActive ? "Active" : "Inactive"} />
          <Separator />
          <DetailRow
            label="Email Verified"
            value={
              user.emailVerified
                ? new Date(user.emailVerified).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not verified"
            }
          />
          <Separator />
          <DetailRow
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
