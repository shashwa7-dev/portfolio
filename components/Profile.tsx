"use client";

interface UserProfileProps {
  user: {
    display_name: string;
    email: string;
    images: { url: string }[];
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      <h2>Logged in</h2>
      <p>Name: {user.display_name}</p>
      <p>Email: {user.email}</p>
      {user.images && user.images[0] && (
        <img src={user.images[0].url} alt="Profile" width="100" />
      )}
    </div>
  );
}
