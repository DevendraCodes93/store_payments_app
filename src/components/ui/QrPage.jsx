"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as htmlToImage from "html-to-image";

export default function QrPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [footer, setFooter] = useState("");
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
  });

  const [qrBg, setQrBg] = useState("#ffffff");
  const [qrFg, setQrFg] = useState("#");
  const [fontColor, setFontColor] = useState("#004d4d");
  const [fontFamily, setFontFamily] = useState("Inter");

  const [tables, setTables] = useState(1);
  const [logoUrl, setLogoUrl] = useState(null);
  const [qrLoadingArr, setQrLoadingArr] = useState([]); // <-- use state for loading

  const qrRefs = useRef([]);
  const qrInstances = useRef([]);
  const QRCodeStylingRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  // Add a ref to each poster card
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

  useEffect(() => {
    import("qr-code-styling").then((mod) => {
      QRCodeStylingRef.current = mod.default;
      setMounted(true);
    });
  }, []);

  // --- Fix loading state for QR codes ---
  useEffect(() => {
    if (!mounted || !QRCodeStylingRef.current) return;
    // Only set loading for new QRs
    const newLoadingArr = [...qrLoadingArr];
    for (let i = qrInstances.current.length; i < tables; i++) {
      newLoadingArr[i] = true;
      qrInstances.current[i] = new QRCodeStylingRef.current({
        width: 256,
        height: 256,
        data: `https://store-payments-app.com/table/${i + 1}`,
        margin: 8,
        dotsOptions: { color: qrFg || "#000", type: "dots" },
        backgroundOptions: { color: qrBg },
        imageOptions: { crossOrigin: "anonymous", imageSize: 0.3, margin: 2 },
      });
    }
    qrInstances.current.length = tables;
    qrRefs.current.length = tables;
    newLoadingArr.length = tables;
    setQrLoadingArr(newLoadingArr);
    // Set loading to false after QR is appended
    setTimeout(() => {
      setQrLoadingArr(Array(tables).fill(false));
    }, 200);
  }, [tables, qrBg, qrFg, mounted]);

  useEffect(() => {
    if (!mounted || !QRCodeStylingRef.current) return;
    // Set loading for all QRs being updated
    setQrLoadingArr(Array(tables).fill(true));
    qrInstances.current.forEach((qr, i) => {
      if (!qr) return;
      qr.update({
        data: `https://store-payments-app.com/table/${i + 1}`,
        image: logoUrl || undefined,
        dotsOptions: { color: qrFg || "#000", type: "dots" },
        backgroundOptions: { color: qrBg },
      });
    });
    setTimeout(() => {
      setQrLoadingArr(Array(tables).fill(false));
    }, 200);
  }, [qrBg, qrFg, logoUrl, mounted, tables]);

  useEffect(() => {
    if (!mounted) return;
    qrInstances.current.forEach((qr, i) => {
      const h = qrRefs.current[i];
      if (qr && h && h.childElementCount === 0) qr.append(h);
    });
  });

  const uploadLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Remove object URL revoke for now (can cause issues if image not loaded yet)
    const url = URL.createObjectURL(f);
    const rounded = await roundImg(url);
    setLogoUrl(rounded);
    // Do not revokeObjectURL here
  };
  // Update dl to download the whole card
  const dl = async (i) => {
    const node = cardRefs.current[i];
    if (!node) return;
    const dataUrl = await htmlToImage.toPng(node, { backgroundColor: qrBg });
    const link = document.createElement("a");
    link.download = `table-${i + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
        color: "#111",
      }}
    >
      <div className="mb-8 ">
        <h1
          className="text-3xl font-extrabold mb-2 tracking-tight"
          style={{
            color: "#111",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
          }}
        >
          DashBoard
        </h1>
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <label className="block text-black font-semibold mb-1">
          Title
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Subtitle
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Footer
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Footer"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Address
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Address"
            value={contact.address}
            onChange={(e) =>
              setContact({ ...contact, address: e.target.value })
            }
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Phone
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Phone"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Email
          <input
            className="rounded border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-black focus:border-black transition-all text-lg font-semibold placeholder-gray-400 w-full"
            placeholder="Email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Tables
          <input
            type="number"
            min={1}
            className="w-full rounded border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-black focus:border-black text-base font-medium"
            value={tables}
            onChange={(e) =>
              setTables(Math.max(1, Number(e.target.value) || 1))
            }
            style={{
              color: "#111",
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
            }}
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          QR Template BG
          <input
            type="color"
            value={qrBg}
            onChange={(e) => setQrBg(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300"
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          QR FG
          <input
            type="color"
            value={qrFg}
            onChange={(e) => setQrFg(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300"
          />
        </label>
        <label className="block text-black font-semibold mb-1">
          Logo
          <div className="w-full">
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
              <span className="block py-2 text-center font-medium">
                Upload Logo
              </span>
            </Button>
          </div>
        </label>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: tables }).map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            className="rounded-xl p-6 shadow text-center border border-gray-200"
            style={{ color: "#000", backgroundColor: qrBg }}
          >
            <h2
              className="mb-2 text-4xl font-extrabold tracking-wide"
              style={{
                color: "#1a202c",
                fontFamily:
                  "'Pacifico', 'Dancing Script', 'Segoe Script', 'Comic Sans MS', cursive, sans-serif",
                letterSpacing: "2px",
                fontWeight: 800,
                fontSize: "2.3rem",
                marginBottom: "0.5rem",
                textShadow: "0 2px 8px #e0e0e0, 0 1px 0 #fff",
              }}
            >
              {title}
            </h2>
            <div
              className=" px-5 py-2 mb-4 inline-block rounded-lg text-lg font-semibold  "
              style={{
                color: "#2d3748",
                fontFamily:
                  "'Quicksand', 'Inter', 'Segoe UI', Arial, sans-serif",
                fontSize: "1.2rem",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              {subtitle}
            </div>
            <div
              className="relative mx-auto mb-4 rounded-xl p-2 bg-white/90 shadow"
              style={{ width: 256, height: 256, backgroundColor: qrBg }}
            >
              <div ref={(el) => (qrRefs.current[idx] = el)} />
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
            <p
              className="whitespace-pre-line text-lg font-medium mt-2 mb-2"
              style={{
                color: "#374151",
                fontFamily:
                  "'Quicksand', 'Inter', 'Segoe UI', Arial, sans-serif",
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              {footer}
            </p>
            <div
              className="mt-4 text-sm text-gray-700 bg-white/70 rounded p-2 shadow-sm"
              style={{
                color: "#222",
                fontFamily:
                  "'Quicksand', 'Inter', 'Segoe UI', Arial, sans-serif",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              <p>{contact.address}</p>
              <p>
                <span className="font-bold text-orange-600">
                  {contact.phone}
                </span>
              </p>
              <p>{contact.email}</p>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => dl(idx)}>
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
