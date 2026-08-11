import React from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-gray-500">
      <span>UniOrg 🎓 · Infraestructura de credenciales verificables</span>
      <span className="text-gray-300">|</span>
      <span>Red: {targetNetwork.name}</span>
    </div>
  );
};