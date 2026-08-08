"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function IssueCredential() {
    const { address } = useAccount();
    const [orgId, setOrgId] = useState("");
    const [recipient, setRecipient] = useState("");
    const [metadataURI, setMetadataURI] = useState("");

    const { writeContractAsync: issueCredential } = useScaffoldWriteContract({
        contractName: "UniOrg",
    });

    const handleIssue = async () => {
        if (!orgId || !recipient || !metadataURI) return;
        try {
            await issueCredential({
                functionName: "issueCredential",
                args: [BigInt(orgId), recipient as `0x${string}`, metadataURI],
            });
            alert("Credencial emitida exitosamente!");
            setOrgId("");
            setRecipient("");
            setMetadataURI("");
        } catch (error) {
            console.error("Error issuing credential:", error);
            alert("Error al emitir credencial");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4">
            <h1 className="text-4xl font-bold mb-8">Emitir Credencial</h1>

            {address ? (
                <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">ID de Organización</label>
                        <input
                            type="number"
                            value={orgId}
                            onChange={(e) => setOrgId(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            placeholder="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Dirección del Recipient</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            placeholder="0x..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Metadata URI (IPFS)</label>
                        <input
                            type="text"
                            value={metadataURI}
                            onChange={(e) => setMetadataURI(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            placeholder="ipfs://..."
                        />
                    </div>

                    <button
                        onClick={handleIssue}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Emitir Credencial
                    </button>

                    <Link href="/" className="block text-center text-blue-600 hover:underline">
                        ← Volver al Dashboard
                    </Link>
                </div>
            ) : (
                <p className="text-xl">Conecta tu wallet para continuar.</p>
            )}
        </div>
    );
}