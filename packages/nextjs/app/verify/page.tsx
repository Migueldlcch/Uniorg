"use client";

import { useState } from "react";
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const truncate = (s: string) => (s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s);
const fmtDate = (ts: bigint) =>
    new Date(Number(ts) * 1000).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });

export default function VerifyCredential() {
    const [credentialId, setCredentialId] = useState("");
    const [searched, setSearched] = useState(false);

    const idArg = /^\d+$/.test(credentialId.trim()) ? BigInt(credentialId.trim()) : undefined;

    const { data: isValid } = useScaffoldReadContract({
        contractName: "UniOrg",
        functionName: "verifyCredential",
        args: [idArg],
    });
    const { data: cred } = useScaffoldReadContract({
        contractName: "UniOrg",
        functionName: "getCredential",
        args: [idArg],
    });
    const { data: org } = useScaffoldReadContract({
        contractName: "UniOrg",
        functionName: "getOrganization",
        args: [cred ? cred.orgId : undefined],
    });

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-12 px-4">
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
                <Link href="/" className="mb-6 inline-block text-sm font-semibold text-indigo-600 hover:underline">
                    ← Volver al inicio
                </Link>

                <div className="rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-xl backdrop-blur">
                    <h1 className="text-3xl font-extrabold text-gray-900">Verificar credencial 🔍</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        No necesitas wallet ni cuenta: la verdad vive en Arbitrum y es pública para todos.
                    </p>

                    <div className="mt-6 flex gap-2">
                        <input
                            type="number"
                            value={credentialId}
                            onChange={(e) => {
                                setCredentialId(e.target.value);
                                setSearched(false);
                            }}
                            placeholder="Ej: 1"
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                            onClick={() => setSearched(true)}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                        >
                            Verificar
                        </button>
                    </div>

                    {searched && idArg === undefined && (
                        <p className="mt-4 text-sm font-semibold text-rose-600">Escribe un número de credencial válido.</p>
                    )}

                    {searched && idArg !== undefined && (
                        <div className="mt-6">
                            {isValid === true && cred && org ? (
                                <div className="overflow-hidden rounded-2xl border border-emerald-200">
                                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white">
                                        <p className="text-lg font-extrabold">✅ CREDENCIAL VÁLIDA</p>
                                    </div>
                                    <div className="space-y-3 bg-white px-6 py-5 text-sm">
                                        <p>
                                            <span className="font-semibold text-gray-500">Emitida por:</span>{" "}
                                            <span className="font-bold text-gray-900">{org.name}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-500">Para:</span>{" "}
                                            <span className="font-mono text-xs">{truncate(cred.recipient)}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-500">Fecha:</span> {fmtDate(cred.issuedAt)}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-500">Metadata:</span>{" "}
                                            <span className="font-mono text-xs break-all">{cred.metadataURI}</span>
                                        </p>
                                        <a
                                            href="https://sepolia.arbiscan.io/address/0xcd2b62013948f6ddd0f64aa19e1287164a06d4ff"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block pt-1 text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            Ver contrato en Arbiscan ↗
                                        </a>
                                    </div>
                                </div>
                            ) : isValid === false ? (
                                <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 text-white">
                                    <p className="text-lg font-extrabold">❌ REVOCADA O INEXISTENTE</p>
                                    <p className="mt-1 text-xs text-rose-100">
                                        Esta credencial no consta como válida en el registro público.
                                    </p>
                                </div>
                            ) : (
                                <div className="h-24 animate-pulse rounded-2xl bg-indigo-50" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}