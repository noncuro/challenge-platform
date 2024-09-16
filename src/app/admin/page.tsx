import { cookies } from "next/headers"
import { Login } from "./login";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRedisClient } from "@/app/api/utils";
import { checkAdminAuth } from "@/app/api/auth/admin/route";
import Admin from "./admin";

export default function AdminPage() {



    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Admin />
      </div>
    )
  }
  
