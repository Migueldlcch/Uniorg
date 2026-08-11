"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function IssueCredential() {
    const { isConnected } = useAccount();
    const [orgId, setOrgId] = useState("");
    const [recipient, setRecipient] = useState("");
    const [metadataURI, setMetadataURI] = useState("");

    const { writeContractAsync: issueCredential } = useScaffoldWriteContract({
        contractName: "UniOrg",
    });

    const handleIssue = async () => {
        if (!orgId || !recipient || !metadataURI) {
            return notification.error("Completa los tres campos para emitir");
        }
        try {
            await issueCredential({
                functionName: "issueCredential",
                args: [BigInt(orgId), recipient as `0x${string}`, metadataURI],
            });
            notification.success("Credencial emitida exitosamente");
            setOrgId("");
            setRecipient("");
            setMetadataURI("");
        } catch (e: any) {
            notification.error(e?.shortMessage || "Error al emitir credencial");
        }
    };

    if (!isConnected) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6">
                <p className="text-lg text-gray-600">Conecta tu wallet para emitir credenciales.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-12 px-4">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
                <Link href="/" className="mb-6 inline-block text-sm font-semibold text-indigo-600 hover:underline">
                    ← Volver al Dashboard
                </Link>

                <div className="rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-xl backdrop-blur">
                    <h1 className="text-3xl font-extrabold text-gray-900">Emitir credencial 🎓</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Un solo acto on-chain: queda firmada por tu organización y verificable para siempre.
                    </p>

                    <div className="mt-6 space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">ID de Organización</label>
                            <input
                                type="number"
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                placeholder="1"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <p className="mt-1 text-xs text-gray-400">El número de tu organización emisora (lo ves en el dashboard).</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Dirección del estudiante</label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0x..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <p className="mt-1 text-xs text-gray-400">La wallet del titular de la credencial.</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Metadata URI (IPFS)</label>
                            <input
                                type="text"
                                value={metadataURI}
                                onChange={(e) => setMetadataURI(e.target.value)}
                                placeholder="ipfs://..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                La referencia al documento. La cadena guarda el sello inmutable, no el archivo.
                            </p>
                        </div>

                        <button
                            onClick={handleIssue}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                        >
                            Emitir credencial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}