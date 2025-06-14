"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleStripeConnect = () => {
    window.location.href = "/api/stripe/connect";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-8 text-3xl font-bold">Connect Stripe Account</h1>
      <p className="mb-6 text-sm text-gray-600">
        Connect your Stripe account so payments go directly to your bank.
      </p>
      <Button
        onClick={handleStripeConnect}
        className="bg-[#635BFF] text-white hover:opacity-90"
      >
        Connect with Stripe
      </Button>
    </div>
  );
}
