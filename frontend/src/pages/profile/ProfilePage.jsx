import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Profile Settings"
        description="Manage your candidate account details, target career role, and preferences."
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your display name and email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue={user?.name || 'Jane Doe'} />
          <Input label="Email Address" type="email" defaultValue={user?.email || 'user@example.com'} />
          <Input label="Target Role" defaultValue="Senior Full Stack Engineer" />
        </CardContent>
        <CardFooter>
          <Button variant="primary" size="sm">Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
