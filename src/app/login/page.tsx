
import { GuestOnly } from "@/components/Auth/GuestOnly";
import { Login } from "@/components/Login";
import { TopBar } from "@/components/TopBar";

export default function LoginPage() {
    return (
        <GuestOnly>
            <main className="bg-rede-bg">
                <TopBar />
                <Login />
            </main>
        </GuestOnly>
    )
}
