import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import API from "../api";

export default function Scan() {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("");
  const codeReaderRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          codeReader.reset();
          handleScanned(result.getText());
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg("Camera permission required or no camera.");
      });

    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
    };
  }, []);

  async function handleScanned(qrText) {
    setMsg("Verifying QR...");
    try {
      const r = await API.post("/scan", { qrText });
      setMsg(
        `Success: +${r.data.coinsCredited} coins. New balance: ${r.data.newBalance}`
      );
    } catch (err) {
      setMsg("Scan error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Scan QR</h2>
      <video ref={videoRef} className="w-full max-w-md border rounded" />
      <p className="mt-4">{msg}</p>
    </div>
  );
}
