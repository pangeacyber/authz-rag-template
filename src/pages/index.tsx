import { HomeComponent } from "@/components/home-component";
import { useAuth } from "@pangeacyber/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { authenticated, user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && !loading) {
      // Redirect to /login-success if user is authenticated
      router.push("/chat");
    } else {
      console.log(user)
    }
}, [user, authenticated, loading])

  return (
    <HomeComponent login={login} />
  );
}
