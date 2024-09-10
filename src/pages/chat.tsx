import { ChatPageComponent } from "@/components/chat-page-component";
import { useAuth } from "@pangeacyber/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"

export default function Chat() {
    const { authenticated, user, logout, loading, getToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authenticated && !loading) {
          router.push("/");
        }
    }, [user, authenticated, loading])
  
    return (
        <>
            <ChatPageComponent user={user} getToken={getToken} logout={logout} />
            <Toaster />
        </>
    );
};