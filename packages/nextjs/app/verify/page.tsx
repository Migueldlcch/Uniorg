"use client";

import { useState } from "react";
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function VerifyCredential() {
    const [credentialId, setCredentialId] = useState("");
    const [verified, setVerified] = useState<boolean | null>(null);

    const { data: isValid } = useScaffoldReadContract({
        contractName: "UniOrg",
        functionName: "verifyCredential",
        args: [credentialId ? BigInt(credentialId) : undefined],
    });

    const handleVerify = () => {
        if (isValid !== undefined) {
            setVerified(isValid as boolean);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4">
            <h1 className="text-4xl font-bold mb-8">Verificar Credencial</h1>

            <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">ID de Credencial</label>
                    <input
                        type="number"
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value)}
                        className="w-full px-4 py-2 border rounded"
                        placeholder="1"
                    />
                </div>

                <button
                    onClick={handleVerify}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    Verificar
                </button>

                {verified !== null && (
                    <div className={`p-4 rounded ${verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {verified ? "✅ Credencial válida" : "❌ Credencial inválida o revocada"}
                    </div>
                )}

                <Link href="/" className="block text-center text-blue-600 hover:underline">
                    ← Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}