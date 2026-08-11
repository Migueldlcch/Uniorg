import React from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  return (
    <footer className="border-t border-indigo-100 bg-white/70 px-4 py-6 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-gray-500 sm:flex-row">
        <p className="font-semibold text-gray-700">
          UniOrg 🎓 <span className="font-normal text-gray-500">· Infraestructura de credenciales verificables</span>
        </p>
        <p>Red: {targetNetwork.name}</p>
        <p>HackEth Lima 2026 · Track Arbitrum</p>
      </div>
    </footer>
  );
};