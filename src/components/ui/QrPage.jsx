"use client";
import React, { useState, useRef, useEffect } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";

export default function QrPage() {
  const [tableCount, setTableCount] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState(null);
  const [emoji, setEmoji] = useState("");
  const [isLive, setIsLive] = useState(false);

  const [pendingTable, setPendingTable] = useState(0);
  const [pendingBg, setPendingBg] = useState(bgColor);
  const [pendingFg, setPendingFg] = useState(fgColor);
  const [pendingFontColor, setPendingFontColor] = useState(fontColor);
  const [pendingFontFamily, setPendingFontFamily] = useState(fontFamily);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [pendingEmoji, setPendingEmoji] = useState(emoji);

  const qrWrappers = useRef([]);
  const qrCodes = useRef([]);
  const emojiPositions = useRef([]);

  const generatePositions = () => {
    return Array.from({ length: 10 }, () => ({
      left: Math.random() * 220 + 10,
      top: Math.random() * 220 + 10,
    }));
  };

  const createRoundedImage = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);

        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    if (tableCount > qrCodes.current.length) {
      for (let i = qrCodes.current.length; i < tableCount; i++) {
        qrCodes.current[i] = new QRCodeStyling({
          width: 256,
          height: 256,
          data: `https://example.com/table/${i + 1}`,
          margin: 8,
          dotsOptions: { color: fgColor, type: "rounded" },
          backgroundOptions: { color: bgColor },
          imageOptions: { crossOrigin: "anonymous", imageSize: 0.3 },
        });
        emojiPositions.current[i] = generatePositions();
      }
    } else if (tableCount < qrCodes.current.length) {
      qrCodes.current.splice(tableCount);
      emojiPositions.current.splice(tableCount);
    }
    qrCodes.current.forEach((qr, i) => {
      const wrap = qrWrappers.current[i];
      if (qr && wrap && wrap.childElementCount === 0) qr.append(wrap);
    });
  }, [tableCount]);

  useEffect(() => {
    qrCodes.current.forEach((qr, i) => {
      qr?.update({
        data: `https://example.com/table/${i + 1}`,
        image: logoUrl || undefined,
        dotsOptions: { color: fgColor },
        backgroundOptions: { color: bgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: 0.3,
          hideBackgroundDots: true,
          margin: 2,
        },
      });
    });
  }, [bgColor, fgColor, logoUrl, tableCount]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const rawUrl = URL.createObjectURL(file);
      const roundedUrl = await createRoundedImage(rawUrl);
      setPendingLogo(roundedUrl);
      if (isLive) setLogoUrl(roundedUrl);
    }
  };

  const propagateIfLive = (setter, liveSetter) => (value) => {
    setter(value);
    if (isLive) liveSetter(value);
  };

  const applyChanges = () => {
    setTableCount(pendingTable);
    setBgColor(pendingBg);
    setFgColor(pendingFg);
    setFontColor(pendingFontColor);
    setFontFamily(pendingFontFamily);
    setLogoUrl(pendingLogo);
    setEmoji(pendingEmoji);
    setIsLive(true);
  };

  const handleDownload = (idx) =>
    qrCodes.current[idx]?.download({
      name: `table-${idx + 1}`,
      extension: "png",
    });

  const tablesArray = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-8 text-3xl font-bold">DashBoard</h1>

      <div className="mb-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Number of tables</label>
          <input
            type="number"
            min={0}
            value={pendingTable}
            onChange={(e) =>
              propagateIfLive(
                setPendingTable,
                setTableCount
              )(Number(e.target.value))
            }
            className="rounded-xl border px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Background</label>
          <input
            type="color"
            value={pendingBg}
            onChange={(e) =>
              propagateIfLive(setPendingBg, setBgColor)(e.target.value)
            }
            className="h-10 w-full rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">QR color</label>
          <input
            type="color"
            value={pendingFg}
            onChange={(e) =>
              propagateIfLive(setPendingFg, setFgColor)(e.target.value)
            }
            className="h-10 w-full rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Emoji</label>
          <input
            type="text"
            maxLength={2}
            value={pendingEmoji}
            placeholder="e.g. ❤️"
            onChange={(e) =>
              propagateIfLive(setPendingEmoji, setEmoji)(e.target.value)
            }
            className="rounded-xl border px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Logo</label>
          <Button variant="outline" className="w-full">
            <label className="w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              Upload Image
            </label>
          </Button>
        </div>
      </div>

      {!isLive && (
        <Button className="mb-8" onClick={applyChanges}>
          Apply Changes
        </Button>
      )}

      {tableCount > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tablesArray.map((n, idx) => (
            <div key={n} className="flex flex-col items-center gap-2">
              <div
                className="relative"
                style={{
                  width: 256,
                  height: 256,
                  fontFamily,
                  color: fontColor,
                }}
              >
                <div ref={(el) => (qrWrappers.current[idx] = el)} />
                {emojiPositions.current[idx] &&
                  emojiPositions.current[idx].map((pos, i) => (
                    <span
                      key={i}
                      className="absolute select-none text-xl"
                      style={{ opacity: 0.4, left: pos.left, top: pos.top }}
                    >
                      {emoji}
                    </span>
                  ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(idx)}
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
