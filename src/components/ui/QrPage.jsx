"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as htmlToImage from "html-to-image";
import { HexColorPicker } from "react-colorful";

export default function QrPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [footer, setFooter] = useState("");
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [qrBg, setQrBg] = useState("#ffffff");
  const [qrFg, setQrFg] = useState("#000000");
  const [tables, setTables] = useState(0);
  const [logoUrl, setLogoUrl] = useState(null);
  const [qrLoadingArr, setQrLoadingArr] = useState([]);
  const [useLogoAsBg, setUseLogoAsBg] = useState(false);

  const qrRefs = useRef([]);
  const qrInstances = useRef([]);
  const QRCodeStylingRef = useRef(null);
  const cardRefs = useRef([]);

  const roundImg = (src) =>
    new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const c = document.createElement("canvas");
        c.width = c.height = s;
        const ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 0, 0, s, s);
        res(c.toDataURL());
      };
      img.src = src;
    });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    import("qr-code-styling").then((mod) => {
      QRCodeStylingRef.current = mod.default;
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !QRCodeStylingRef.current) return;

    const newLoadingArr = Array(tables).fill(true);
    const QRCode = QRCodeStylingRef.current;

    for (let i = qrInstances.current.length; i < tables; i++) {
      newLoadingArr[i] = true;
      qrInstances.current[i] = new QRCodeStylingRef.current({
        width: 256,
        height: 256,
        data: `https://store-payments-app.com/table/${i + 1}`,
        margin: 8,
        dotsOptions: { color: qrFg || "#000", type: "rounded" },
        backgroundOptions: { color: qrBg },
        imageOptions: { crossOrigin: "anonymous", imageSize: 0.3, margin: 2 },
      });
    }

    qrInstances.current.length = tables;
    qrRefs.current.length = tables;
    setQrLoadingArr(newLoadingArr);

    setTimeout(() => {
      qrInstances.current.forEach((qr, i) => {
        if (!qr) return;
        qr.update({
          data: `https://store-payments-app.com/table/${i + 1}`,
          image: logoUrl || undefined,
          dotsOptions: { color: qrFg || "#000", type: "rounded" },
          backgroundOptions: { color: qrBg },
        });

        const holder = qrRefs.current[i];
        if (holder && holder.childElementCount === 0) {
          qr.append(holder);
        }
      });
      setQrLoadingArr(Array(tables).fill(false));
    }, 300);
  }, [tables, qrBg, qrFg, mounted, logoUrl]);

  const uploadLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const rounded = await roundImg(url);
    setLogoUrl(rounded);
  };

  const dl = async () => {
    const allCards = cardRefs.current.filter(Boolean);
    for (let i = 0; i < allCards.length; i++) {
      const node = allCards[i];
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: useLogoAsBg ? undefined : qrBg,
      });
      const link = document.createElement("a");
      link.download = `table-${i + 1}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="min-h-screen p-8 font-poppins text-[#111] bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <label className="block font-semibold">
          Title
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block font-semibold">
          Subtitle
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </label>
        <label className="block font-semibold">
          Footer
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
          />
        </label>
        <label className="block font-semibold">
          Address
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={contact.address}
            onChange={(e) =>
              setContact({ ...contact, address: e.target.value })
            }
          />
        </label>
        <label className="block font-semibold">
          Phone
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          />
        </label>
        <label className="block font-semibold">
          Email
          <input
            className="mt-1 w-full rounded border bg-white p-3 text-lg"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
          />
        </label>
        <label className="block font-semibold">
          Tables
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded border bg-white p-2 text-base"
            value={tables}
            onChange={(e) =>
              setTables(Math.max(1, Number(e.target.value) || 1))
            }
          />
        </label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={useLogoAsBg}
            onChange={(e) => setUseLogoAsBg(e.target.checked)}
          />
          Set logo as QR background
        </label>
        {!useLogoAsBg && (
          <div className="font-semibold">
            QR Template BG
            <div className="mt-1 max-w-[220px]">
              <HexColorPicker
                color={qrBg}
                onChange={setQrBg}
                className="w-full"
              />
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="inline-block h-6 w-6 rounded border"
                  style={{ background: qrBg }}
                />
                <span className="text-xs">{qrBg}</span>
              </div>
            </div>
          </div>
        )}
        <label className="font-semibold">
          QR FG
          <input
            type="color"
            value={qrFg}
            onChange={(e) => setQrFg(e.target.value)}
            className="mt-1 h-8 w-8 rounded border"
          />
        </label>
        <label className="font-semibold">
          Logo
          <div className="mt-1 w-full">
            <input
              id="logo-upload"
              hidden
              type="file"
              accept="image/*"
              onChange={uploadLogo}
            />
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => document.getElementById("logo-upload").click()}
            >
              Upload Logo
            </Button>
          </div>
        </label>
      </section>

      <div className="mb-6">
        <Button
          size="lg"
          variant="outline"
          className="w-full md:w-auto"
          onClick={dl}
        >
          Download All
        </Button>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: tables }).map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            className="relative flex w-full max-w-[320px] flex-col items-center overflow-hidden rounded-xl border bg-white p-6 shadow"
            style={{
              background: useLogoAsBg ? undefined : qrBg,
              minHeight: "500px",
            }}
          >
            {useLogoAsBg && logoUrl && (
              <img
                src={logoUrl}
                alt="bg logo"
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                style={{
                  backgroundColor: qrBg,
                  filter: "blur(8px)",
                  transform: "scale(1.1)",
                }}
              />
            )}

            <div className="relative z-10 flex w-full flex-col items-center">
              {title && (
                <h2
                  className="mb-2 font-extrabold tracking-wide text-[#1a202c] text-center truncate overflow-hidden playball-title"
                  style={{
                    fontWeight: 800,
                    fontSize: "3rem",
                    marginBottom: "0.5rem",
                    textShadow: "0 2px 8px #e0e0e0, 0 1px 0 #fff",
                    letterSpacing: "2px",
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <div
                  className="border border-gray-300 px-5 py-2 mb-4 inline-block rounded-lg text-lg font-semibold shadow-sm font-quicksand text-[#2d3748]"
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    background: "none",
                  }}
                >
                  {subtitle}
                </div>
              )}

              <div
                className="relative mx-auto mb-4 rounded-xl p-2 bg-white/90 shadow flex items-center justify-center"
                style={{
                  width: 256,
                  height: 256,
                  background: useLogoAsBg ? undefined : qrBg,
                }}
              >
                <div
                  ref={(el) => (qrRefs.current[idx] = el)}
                  className="mx-auto"
                />
                {qrLoadingArr[idx] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <svg
                      className="h-8 w-8 animate-spin"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                      <path d="M22 12a10 10 0 0 1-10 10" />
                    </svg>
                  </div>
                )}
              </div>

              {footer && (
                <p className="font-quicksand mb-2 whitespace-pre-line text-lg font-medium">
                  {footer}
                </p>
              )}

              {(contact.address || contact.phone || contact.email) && (
                <div className="flex  flex-col  justify-center items-center font-quicksand mt-4 rounded bg-white/70 p-2 text-sm text-gray-700 shadow-sm">
                  {contact.address && <p>{contact.address}</p>}
                  {contact.phone && (
                    <p>
                      <span className="font-bold text-orange-600">
                        {contact.phone}
                      </span>
                    </p>
                  )}
                  {contact.email && <p>{contact.email}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
